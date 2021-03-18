package api

import (
	"errors"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

// POST /api/org/users
func AddOrgUserToCurrentOrg(c *models.ReqContext, cmd models.AddOrgUserCommand) response.Response {
	cmd.OrgId = c.OrgId
	return addOrgUserHelper(cmd)
}

// POST /api/orgs/:orgId/users
func AddOrgUser(c *models.ReqContext, cmd models.AddOrgUserCommand) response.Response {
	cmd.OrgId = c.ParamsInt64(":orgId")
	return addOrgUserHelper(cmd)
}

func addOrgUserHelper(cmd models.AddOrgUserCommand) response.Response {
	if !cmd.Role.IsValid() {
		return response.Error(400, "Rôle spécifié invalide", nil)
	}

	userQuery := models.GetUserByLoginQuery{LoginOrEmail: cmd.LoginOrEmail}
	err := bus.Dispatch(&userQuery)
	if err != nil {
		return response.Error(404, "Utilisateur non trouvé", nil)
	}

	userToAdd := userQuery.Result

	cmd.UserId = userToAdd.Id

	if err := bus.Dispatch(&cmd); err != nil {
		if errors.Is(err, models.ErrOrgUserAlreadyAdded) {
			return response.JSON(409, util.DynMap{
				"message": "Utilisateur déjà membre de l'organisation",
				"userId":  cmd.UserId,
			})
		}
		return response.Error(500, "Impossible d'ajouter l'utilisateur à l'organisation", err)
	}

	return response.JSON(200, util.DynMap{
		"message": "Utilisateur ajouté à l'organisation",
		"userId":  cmd.UserId,
	})
}

// GET /api/org/users
func (hs *HTTPServer) GetOrgUsersForCurrentOrg(c *models.ReqContext) response.Response {
	result, err := hs.getOrgUsersHelper(&models.GetOrgUsersQuery{
		OrgId: c.OrgId,
		Query: c.Query("query"),
		Limit: c.QueryInt("limit"),
	}, c.SignedInUser)

	if err != nil {
		return response.Error(500, "Erreur de récupération des utilisateurs pour l'organisation actuelle", err)
	}

	return response.JSON(200, result)
}

// GET /api/org/users/lookup
func (hs *HTTPServer) GetOrgUsersForCurrentOrgLookup(c *models.ReqContext) response.Response {
	isAdmin, err := isOrgAdminFolderAdminOrTeamAdmin(c)
	if err != nil {
		return response.Error(500, "Erreur de récupération des utilisateurs pour l'organisation actuelle", err)
	}

	if !isAdmin {
		return response.Error(403, "Permission refusée", nil)
	}

	orgUsers, err := hs.getOrgUsersHelper(&models.GetOrgUsersQuery{
		OrgId: c.OrgId,
		Query: c.Query("query"),
		Limit: c.QueryInt("limit"),
	}, c.SignedInUser)

	if err != nil {
		return response.Error(500, "Erreur de récupération des utilisateurs pour l'organisation actuelle", err)
	}

	result := make([]*dtos.UserLookupDTO, 0)

	for _, u := range orgUsers {
		result = append(result, &dtos.UserLookupDTO{
			UserID:    u.UserId,
			Login:     u.Login,
			AvatarURL: u.AvatarUrl,
		})
	}

	return response.JSON(200, result)
}

func isOrgAdminFolderAdminOrTeamAdmin(c *models.ReqContext) (bool, error) {
	if c.OrgRole == models.ROLE_ADMIN {
		return true, nil
	}

	hasAdminPermissionInFoldersQuery := models.HasAdminPermissionInFoldersQuery{SignedInUser: c.SignedInUser}
	if err := bus.Dispatch(&hasAdminPermissionInFoldersQuery); err != nil {
		return false, err
	}

	if hasAdminPermissionInFoldersQuery.Result {
		return true, nil
	}

	isAdminOfTeamsQuery := models.IsAdminOfTeamsQuery{SignedInUser: c.SignedInUser}
	if err := bus.Dispatch(&isAdminOfTeamsQuery); err != nil {
		return false, err
	}

	return isAdminOfTeamsQuery.Result, nil
}

// GET /api/orgs/:orgId/users
func (hs *HTTPServer) GetOrgUsers(c *models.ReqContext) response.Response {
	result, err := hs.getOrgUsersHelper(&models.GetOrgUsersQuery{
		OrgId: c.ParamsInt64(":orgId"),
		Query: "",
		Limit: 0,
	}, c.SignedInUser)

	if err != nil {
		return response.Error(500, "Erreur de récupération des utilisateurs", err)
	}

	return response.JSON(200, result)
}

func (hs *HTTPServer) getOrgUsersHelper(query *models.GetOrgUsersQuery, signedInUser *models.SignedInUser) ([]*models.OrgUserDTO, error) {
	if err := bus.Dispatch(query); err != nil {
		return nil, err
	}

	filteredUsers := make([]*models.OrgUserDTO, 0, len(query.Result))
	for _, user := range query.Result {
		if dtos.IsHiddenUser(user.Login, signedInUser, hs.Cfg) {
			continue
		}
		user.AvatarUrl = dtos.GetGravatarUrl(user.Email)

		filteredUsers = append(filteredUsers, user)
	}

	return filteredUsers, nil
}

// PATCH /api/org/users/:userId
func UpdateOrgUserForCurrentOrg(c *models.ReqContext, cmd models.UpdateOrgUserCommand) response.Response {
	cmd.OrgId = c.OrgId
	cmd.UserId = c.ParamsInt64(":userId")
	return updateOrgUserHelper(cmd)
}

// PATCH /api/orgs/:orgId/users/:userId
func UpdateOrgUser(c *models.ReqContext, cmd models.UpdateOrgUserCommand) response.Response {
	cmd.OrgId = c.ParamsInt64(":orgId")
	cmd.UserId = c.ParamsInt64(":userId")
	return updateOrgUserHelper(cmd)
}

func updateOrgUserHelper(cmd models.UpdateOrgUserCommand) response.Response {
	if !cmd.Role.IsValid() {
		return response.Error(400, "Rôle spécifié invalide", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		if errors.Is(err, models.ErrLastOrgAdmin) {
			return response.Error(400, "Cannot change role so that there is no organization admin left", nil)
		}
		return response.Error(500, "Failed update org user", err)
	}

	return response.Success("Utilisateur de l'organisation mis a jour")
}

// DELETE /api/org/users/:userId
func RemoveOrgUserForCurrentOrg(c *models.ReqContext) response.Response {
	return removeOrgUserHelper(&models.RemoveOrgUserCommand{
		UserId:                   c.ParamsInt64(":userId"),
		OrgId:                    c.OrgId,
		ShouldDeleteOrphanedUser: true,
	})
}

// DELETE /api/orgs/:orgId/users/:userId
func RemoveOrgUser(c *models.ReqContext) response.Response {
	return removeOrgUserHelper(&models.RemoveOrgUserCommand{
		UserId: c.ParamsInt64(":userId"),
		OrgId:  c.ParamsInt64(":orgId"),
	})
}

func removeOrgUserHelper(cmd *models.RemoveOrgUserCommand) response.Response {
	if err := bus.Dispatch(cmd); err != nil {
		if errors.Is(err, models.ErrLastOrgAdmin) {
			return response.Error(400, "Impossible d'enlever le dernier admin de l'organisation", nil)
		}
		return response.Error(500, "Failed to remove user from organization", err)
	}

	if cmd.UserWasDeleted {
		return response.Success("Utilisateur supprimé")
	}

	return response.Success("Utilisateur enlevé de l'organisation")
}
