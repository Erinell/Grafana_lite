package api

import (
	"errors"
	"fmt"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/metrics"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func AdminCreateUser(c *models.ReqContext, form dtos.AdminCreateUserForm) response.Response {
	cmd := models.CreateUserCommand{
		Login:    form.Login,
		Email:    form.Email,
		Password: form.Password,
		Name:     form.Name,
		OrgId:    form.OrgId,
	}

	if len(cmd.Login) == 0 {
		cmd.Login = cmd.Email
		if len(cmd.Login) == 0 {
			return response.Error(400, "Erreur de validation, spécifiez email ou nom", nil)
		}
	}

	if len(cmd.Password) < 4 {
		return response.Error(400, "Mot de passe manquant ou trop court", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		if errors.Is(err, models.ErrOrgNotFound) {
			return response.Error(400, err.Error(), nil)
		}

		if errors.Is(err, models.ErrUserAlreadyExists) {
			return response.Error(412, fmt.Sprintf("Utilisateur avec email '%s' ou nom '%s' existe déjà", form.Email, form.Login), err)
		}

		return response.Error(500, "failed to create user", err)
	}

	metrics.MApiAdminUserCreate.Inc()

	user := cmd.Result

	result := models.UserIdDTO{
		Message: "Utilisateur créé",
		Id:      user.Id,
	}

	return response.JSON(200, result)
}

func AdminUpdateUserPassword(c *models.ReqContext, form dtos.AdminUpdateUserPasswordForm) response.Response {
	userID := c.ParamsInt64(":id")

	if len(form.Password) < 4 {
		return response.Error(400, "Mot de passe trop court", nil)
	}

	userQuery := models.GetUserByIdQuery{Id: userID}

	if err := bus.Dispatch(&userQuery); err != nil {
		return response.Error(500, "Impossible de lire depuis la base de donnée", err)
	}

	passwordHashed, err := util.EncodePassword(form.Password, userQuery.Result.Salt)
	if err != nil {
		return response.Error(500, "Impossible d'encoder le mot de passe", err)
	}

	cmd := models.ChangeUserPasswordCommand{
		UserId:      userID,
		NewPassword: passwordHashed,
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return response.Error(500, "Erreur de mise à jour du mot de passe", err)
	}

	return response.Success("Mot de passe mis à jour")
}

// PUT /api/admin/users/:id/permissions
func AdminUpdateUserPermissions(c *models.ReqContext, form dtos.AdminUpdateUserPermissionsForm) response.Response {
	userID := c.ParamsInt64(":id")

	cmd := models.UpdateUserPermissionsCommand{
		UserId:         userID,
		IsGrafanaAdmin: form.IsGrafanaAdmin,
	}

	if err := bus.Dispatch(&cmd); err != nil {
		if errors.Is(err, models.ErrLastGrafanaAdmin) {
			return response.Error(400, models.ErrLastGrafanaAdmin.Error(), nil)
		}

		return response.Error(500, "Erreur de mise à jour des permissions", err)
	}

	return response.Success("Permissions mises à jour")
}

func AdminDeleteUser(c *models.ReqContext) response.Response {
	userID := c.ParamsInt64(":id")

	cmd := models.DeleteUserCommand{UserId: userID}

	if err := bus.Dispatch(&cmd); err != nil {
		if errors.Is(err, models.ErrUserNotFound) {
			return response.Error(404, models.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Erreur de suppression", err)
	}

	return response.Success("Utilisateur supprimé")
}

// POST /api/admin/users/:id/disable
func (hs *HTTPServer) AdminDisableUser(c *models.ReqContext) response.Response {
	userID := c.ParamsInt64(":id")

	// External users shouldn't be disabled from API
	authInfoQuery := &models.GetAuthInfoQuery{UserId: userID}
	if err := bus.Dispatch(authInfoQuery); !errors.Is(err, models.ErrUserNotFound) {
		return response.Error(500, "Impossible de désactiver un utilisateur externe", nil)
	}

	disableCmd := models.DisableUserCommand{UserId: userID, IsDisabled: true}
	if err := bus.Dispatch(&disableCmd); err != nil {
		if errors.Is(err, models.ErrUserNotFound) {
			return response.Error(404, models.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Erreur de désactivation", err)
	}

	err := hs.AuthTokenService.RevokeAllUserTokens(c.Req.Context(), userID)
	if err != nil {
		return response.Error(500, "Erreur de désactivation", err)
	}

	return response.Success("Utilisateur désactivé")
}

// POST /api/admin/users/:id/enable
func AdminEnableUser(c *models.ReqContext) response.Response {
	userID := c.ParamsInt64(":id")

	// External users shouldn't be disabled from API
	authInfoQuery := &models.GetAuthInfoQuery{UserId: userID}
	if err := bus.Dispatch(authInfoQuery); !errors.Is(err, models.ErrUserNotFound) {
		return response.Error(500, "Impossible d'activer un utilisateur externe", nil)
	}

	disableCmd := models.DisableUserCommand{UserId: userID, IsDisabled: false}
	if err := bus.Dispatch(&disableCmd); err != nil {
		if errors.Is(err, models.ErrUserNotFound) {
			return response.Error(404, models.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Erreur d'activation", err)
	}

	return response.Success("Utilisateur activé")
}

// POST /api/admin/users/:id/logout
func (hs *HTTPServer) AdminLogoutUser(c *models.ReqContext) response.Response {
	userID := c.ParamsInt64(":id")

	if c.UserId == userID {
		return response.Error(400, "Vous ne pouvez pas vous déconnecté", nil)
	}

	return hs.logoutUserFromAllDevicesInternal(c.Req.Context(), userID)
}

// GET /api/admin/users/:id/auth-tokens
func (hs *HTTPServer) AdminGetUserAuthTokens(c *models.ReqContext) response.Response {
	userID := c.ParamsInt64(":id")
	return hs.getUserAuthTokensInternal(c, userID)
}

// POST /api/admin/users/:id/revoke-auth-token
func (hs *HTTPServer) AdminRevokeUserAuthToken(c *models.ReqContext, cmd models.RevokeAuthTokenCmd) response.Response {
	userID := c.ParamsInt64(":id")
	return hs.revokeUserAuthTokenInternal(c, userID, cmd)
}
