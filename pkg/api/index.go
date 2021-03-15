package api

import (
	"fmt"
	"sort"
	"strings"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	// Themes
	lightName = "light"
	darkName  = "dark"
)

func (hs *HTTPServer) getProfileNode(c *models.ReqContext) *dtos.NavLink {
	// Only set login if it's different from the name
	var login string
	if c.SignedInUser.Login != c.SignedInUser.NameOrFallback() {
		login = c.SignedInUser.Login
	}
	gravatarURL := dtos.GetGravatarUrl(c.Email)

	children := []*dtos.NavLink{
		{
			Text: "Preferences", Id: "profile-settings", Url: hs.Cfg.AppSubURL + "/profile", Icon: "sliders-v-alt",
		},
	}

	if setting.AddChangePasswordLink() {
		children = append(children, &dtos.NavLink{
			Text: "Change Password", Id: "change-password", Url: hs.Cfg.AppSubURL + "/profile/password",
			Icon: "lock", HideFromMenu: true,
		})
	}

	if !setting.DisableSignoutMenu {
		// add sign out first
		children = append(children, &dtos.NavLink{
			Text:         "Sign out",
			Id:           "sign-out",
			Url:          hs.Cfg.AppSubURL + "/logout",
			Icon:         "arrow-from-right",
			Target:       "_self",
			HideFromTabs: true,
		})
	}

	return &dtos.NavLink{
		Text:         c.SignedInUser.NameOrFallback(),
		SubTitle:     login,
		Id:           "profile",
		Img:          gravatarURL,
		Url:          hs.Cfg.AppSubURL + "/profile",
		HideFromMenu: true,
		SortWeight:   dtos.WeightProfile,
		Children:     children,
	}
}

func (hs *HTTPServer) getAppLinks(c *models.ReqContext) ([]*dtos.NavLink, error) {
	enabledPlugins, err := hs.PluginManager.GetEnabledPlugins(c.OrgId)
	if err != nil {
		return nil, err
	}

	appLinks := []*dtos.NavLink{}
	for _, plugin := range enabledPlugins.Apps {
		if !plugin.Pinned {
			continue
		}

		appLink := &dtos.NavLink{
			Text:       plugin.Name,
			Id:         "plugin-page-" + plugin.Id,
			Url:        plugin.DefaultNavUrl,
			Img:        plugin.Info.Logos.Small,
			SortWeight: dtos.WeightPlugin,
		}

		for _, include := range plugin.Includes {
			if !c.HasUserRole(include.Role) {
				continue
			}

			if include.Type == "page" && include.AddToNav {
				var link *dtos.NavLink
				if len(include.Path) > 0 {
					link = &dtos.NavLink{
						Url:  hs.Cfg.AppSubURL + include.Path,
						Text: include.Name,
					}
					if include.DefaultNav {
						appLink.Url = link.Url // Overwrite the hardcoded page logic
					}
				} else {
					link = &dtos.NavLink{
						Url:  hs.Cfg.AppSubURL + "/plugins/" + plugin.Id + "/page/" + include.Slug,
						Text: include.Name,
					}
				}
				link.Icon = include.Icon
				appLink.Children = append(appLink.Children, link)
			}

			if include.Type == "dashboard" && include.AddToNav {
				link := &dtos.NavLink{
					Url:  hs.Cfg.AppSubURL + "/dashboard/db/" + include.Slug,
					Text: include.Name,
				}
				appLink.Children = append(appLink.Children, link)
			}
		}

		if len(appLink.Children) > 0 {
			appLinks = append(appLinks, appLink)
		}
	}

	return appLinks, nil
}

func (hs *HTTPServer) getNavTree(c *models.ReqContext, hasEditPerm bool) ([]*dtos.NavLink, error) {
	navTree := []*dtos.NavLink{}

	if hasEditPerm {
		children := []*dtos.NavLink{
			{Text: "Tableau", Icon: "apps", Url: hs.Cfg.AppSubURL + "/dashboard/new"},
		}
		if c.OrgRole == models.ROLE_ADMIN || c.OrgRole == models.ROLE_EDITOR {
			children = append(children, &dtos.NavLink{
				Text: "Dossier", SubTitle: "Créer un dossier pour organiser vos tableaux", Id: "folder",
				Icon: "folder-plus", Url: hs.Cfg.AppSubURL + "/dashboards/folder/new",
			})
		}
		children = append(children, &dtos.NavLink{
			Text: "Importer", SubTitle: "Importer un tableau d'un fichier ou sur Grafana.com", Id: "import", Icon: "import",
			Url: hs.Cfg.AppSubURL + "/dashboard/import",
		})
		navTree = append(navTree, &dtos.NavLink{
			Text:       "Créer",
			Id:         "create",
			Icon:       "plus",
			Url:        hs.Cfg.AppSubURL + "/dashboard/new",
			Children:   children,
			SortWeight: dtos.WeightCreate,
		})
	}

	dashboardChildNavs := []*dtos.NavLink{
		{Text: "Accueil", Id: "home", Url: hs.Cfg.AppSubURL + "/", Icon: "home-alt", HideFromTabs: true},
		{Text: "Divider", Divider: true, Id: "divider", HideFromTabs: true},
		{Text: "Gérer", Id: "manage-dashboards", Url: hs.Cfg.AppSubURL + "/dashboards", Icon: "sitemap"},
		{Text: "Playlists", Id: "playlists", Url: hs.Cfg.AppSubURL + "/playlists", Icon: "presentation-play"},
	}

	if c.IsSignedIn {
		dashboardChildNavs = append(dashboardChildNavs, &dtos.NavLink{
			Text: "Snapshots",
			Id:   "snapshots",
			Url:  hs.Cfg.AppSubURL + "/dashboard/snapshots",
			Icon: "camera",
		})
	}

	navTree = append(navTree, &dtos.NavLink{
		Text:       "Tableaux",
		Id:         "dashboards",
		SubTitle:   "Gérer les tableaux et les dossiers",
		Icon:       "apps",
		Url:        hs.Cfg.AppSubURL + "/",
		SortWeight: dtos.WeightDashboard,
		Children:   dashboardChildNavs,
	})

	if setting.ExploreEnabled && (c.OrgRole == models.ROLE_ADMIN || c.OrgRole == models.ROLE_EDITOR || setting.ViewersCanEdit) {
		navTree = append(navTree, &dtos.NavLink{
			Text:       "Explorer",
			Id:         "explore",
			SubTitle:   "Explorer vos données",
			Icon:       "compass",
			SortWeight: dtos.WeightExplore,
			Url:        hs.Cfg.AppSubURL + "/explore",
		})
	}

	if c.IsSignedIn {
		navTree = append(navTree, hs.getProfileNode(c))
	}

	if setting.AlertingEnabled && (c.OrgRole == models.ROLE_ADMIN || c.OrgRole == models.ROLE_EDITOR) {
		alertChildNavs := []*dtos.NavLink{
			{Text: "Règles d'alerte", Id: "alert-list", Url: hs.Cfg.AppSubURL + "/alerting/list", Icon: "list-ul"},
			{
				Text: "Notifications", Id: "channels", Url: hs.Cfg.AppSubURL + "/alerting/notifications",
				Icon: "comment-alt-share",
			},
		}

		navTree = append(navTree, &dtos.NavLink{
			Text:       "Alertes",
			SubTitle:   "Règles et notifications",
			Id:         "alerting",
			Icon:       "bell",
			Url:        hs.Cfg.AppSubURL + "/alerting/list",
			Children:   alertChildNavs,
			SortWeight: dtos.WeightAlerting,
		})
	}

	appLinks, err := hs.getAppLinks(c)
	if err != nil {
		return nil, err
	}
	navTree = append(navTree, appLinks...)

	configNodes := []*dtos.NavLink{}

	if c.OrgRole == models.ROLE_ADMIN {
		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Sources de données",
			Icon:        "database",
			Description: "Ajouter et configurer une source de données",
			Id:          "datasources",
			Url:         hs.Cfg.AppSubURL + "/datasources",
		})
		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Utilisateurs",
			Id:          "users",
			Description: "Gérer les utilisateurs",
			Icon:        "user",
			Url:         hs.Cfg.AppSubURL + "/org/users",
		})
	}

	if c.OrgRole == models.ROLE_ADMIN || (hs.Cfg.EditorsCanAdmin && c.OrgRole == models.ROLE_EDITOR) {
		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Equipes",
			Id:          "teams",
			Description: "Gérer les équipes",
			Icon:        "users-alt",
			Url:         hs.Cfg.AppSubURL + "/org/teams",
		})
	}

	if c.OrgRole == models.ROLE_ADMIN {
		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Plugins",
			Id:          "plugins",
			Description: "Voir et configurer les plugins",
			Icon:        "plug",
			Url:         hs.Cfg.AppSubURL + "/plugins",
		})

		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Préférences",
			Id:          "org-settings",
			Description: "Préférences organisation",
			Icon:        "sliders-v-alt",
			Url:         hs.Cfg.AppSubURL + "/org",
		})
		configNodes = append(configNodes, &dtos.NavLink{
			Text:        "Clés API",
			Id:          "apikeys",
			Description: "Gérer et créer les clés API",
			Icon:        "key-skeleton-alt",
			Url:         hs.Cfg.AppSubURL + "/org/apikeys",
		})
	}

	if len(configNodes) > 0 {
		navTree = append(navTree, &dtos.NavLink{
			Id:         dtos.NavIDCfg,
			Text:       "Configuration",
			SubTitle:   "Organisation : " + c.OrgName,
			Icon:       "cog",
			Url:        configNodes[0].Url,
			SortWeight: dtos.WeightConfig,
			Children:   configNodes,
		})
	}

	if c.IsGrafanaAdmin {
		adminNavLinks := []*dtos.NavLink{
			{Text: "Utilisateurs", Id: "global-users", Url: hs.Cfg.AppSubURL + "/admin/users", Icon: "user"},
			{Text: "Organisations", Id: "global-orgs", Url: hs.Cfg.AppSubURL + "/admin/orgs", Icon: "building"},
			{Text: "Options", Id: "server-settings", Url: hs.Cfg.AppSubURL + "/admin/settings", Icon: "sliders-v-alt"},
			{Text: "Stats", Id: "server-stats", Url: hs.Cfg.AppSubURL + "/admin/stats", Icon: "graph-bar"},
		}

		if hs.Cfg.LDAPEnabled {
			adminNavLinks = append(adminNavLinks, &dtos.NavLink{
				Text: "LDAP", Id: "ldap", Url: hs.Cfg.AppSubURL + "/admin/ldap", Icon: "book",
			})
		}

		navTree = append(navTree, &dtos.NavLink{
			Text:         "Serveur admin",
			SubTitle:     "Gérer les utilisateurs et orgs",
			HideFromTabs: true,
			Id:           "admin",
			Icon:         "shield",
			Url:          hs.Cfg.AppSubURL + "/admin/users",
			SortWeight:   dtos.WeightAdmin,
			Children:     adminNavLinks,
		})
	}

	helpVersion := fmt.Sprintf(`%s v%s (%s)`, setting.ApplicationName, setting.BuildVersion, setting.BuildCommit)
	if hs.Cfg.AnonymousHideVersion && !c.IsSignedIn {
		helpVersion = setting.ApplicationName
	}

	navTree = append(navTree, &dtos.NavLink{
		Text:         "Aide",
		SubTitle:     helpVersion,
		Id:           "help",
		Url:          "#",
		Icon:         "question-circle",
		HideFromMenu: true,
		SortWeight:   dtos.WeightHelp,
		Children:     []*dtos.NavLink{},
	})

	return navTree, nil
}

func (hs *HTTPServer) setIndexViewData(c *models.ReqContext) (*dtos.IndexViewData, error) {
	hasEditPermissionInFoldersQuery := models.HasEditPermissionInFoldersQuery{SignedInUser: c.SignedInUser}
	if err := bus.Dispatch(&hasEditPermissionInFoldersQuery); err != nil {
		return nil, err
	}
	hasEditPerm := hasEditPermissionInFoldersQuery.Result

	settings, err := hs.getFrontendSettingsMap(c)
	if err != nil {
		return nil, err
	}

	settings["dateFormats"] = hs.Cfg.DateFormats

	prefsQuery := models.GetPreferencesWithDefaultsQuery{User: c.SignedInUser}
	if err := bus.Dispatch(&prefsQuery); err != nil {
		return nil, err
	}
	prefs := prefsQuery.Result

	// Read locale from accept-language
	acceptLang := c.Req.Header.Get("Accept-Language")
	locale := "en-US"

	if len(acceptLang) > 0 {
		parts := strings.Split(acceptLang, ",")
		locale = parts[0]
	}

	appURL := setting.AppUrl
	appSubURL := hs.Cfg.AppSubURL

	// special case when doing localhost call from image renderer
	if c.IsRenderCall && !hs.Cfg.ServeFromSubPath {
		appURL = fmt.Sprintf("%s://localhost:%s", hs.Cfg.Protocol, hs.Cfg.HTTPPort)
		appSubURL = ""
		settings["appSubUrl"] = ""
	}

	navTree, err := hs.getNavTree(c, hasEditPerm)
	if err != nil {
		return nil, err
	}

	data := dtos.IndexViewData{
		User: &dtos.CurrentUser{
			Id:                         c.UserId,
			IsSignedIn:                 c.IsSignedIn,
			Login:                      c.Login,
			Email:                      c.Email,
			Name:                       c.Name,
			OrgCount:                   c.OrgCount,
			OrgId:                      c.OrgId,
			OrgName:                    c.OrgName,
			OrgRole:                    c.OrgRole,
			GravatarUrl:                dtos.GetGravatarUrl(c.Email),
			IsGrafanaAdmin:             c.IsGrafanaAdmin,
			LightTheme:                 prefs.Theme == lightName,
			Timezone:                   prefs.Timezone,
			Locale:                     locale,
			HelpFlags1:                 c.HelpFlags1,
			HasEditPermissionInFolders: hasEditPerm,
		},
		Settings:                settings,
		Theme:                   prefs.Theme,
		AppUrl:                  appURL,
		AppSubUrl:               appSubURL,
		GoogleAnalyticsId:       setting.GoogleAnalyticsId,
		GoogleTagManagerId:      setting.GoogleTagManagerId,
		BuildVersion:            setting.BuildVersion,
		BuildCommit:             setting.BuildCommit,
		NewGrafanaVersion:       hs.PluginManager.GrafanaLatestVersion,
		NewGrafanaVersionExists: hs.PluginManager.GrafanaHasUpdate,
		AppName:                 setting.ApplicationName,
		AppNameBodyClass:        getAppNameBodyClass(hs.License.HasValidLicense()),
		FavIcon:                 "public/img/fav32.png",
		AppleTouchIcon:          "public/img/apple-touch-icon.png",
		AppTitle:                "Grafana",
		NavTree:                 navTree,
		Sentry:                  &hs.Cfg.Sentry,
		Nonce:                   c.RequestNonce,
		ContentDeliveryURL:      hs.Cfg.GetContentDeliveryURL(hs.License.ContentDeliveryPrefix()),
	}

	if setting.DisableGravatar {
		data.User.GravatarUrl = hs.Cfg.AppSubURL + "/public/img/user_profile.png"
	}

	if len(data.User.Name) == 0 {
		data.User.Name = data.User.Login
	}

	themeURLParam := c.Query("theme")
	if themeURLParam == lightName {
		data.User.LightTheme = true
		data.Theme = lightName
	} else if themeURLParam == darkName {
		data.User.LightTheme = false
		data.Theme = darkName
	}

	hs.HooksService.RunIndexDataHooks(&data, c)

	sort.SliceStable(data.NavTree, func(i, j int) bool {
		return data.NavTree[i].SortWeight < data.NavTree[j].SortWeight
	})

	return &data, nil
}

func (hs *HTTPServer) Index(c *models.ReqContext) {
	data, err := hs.setIndexViewData(c)
	if err != nil {
		c.Handle(hs.Cfg, 500, "Failed to get settings", err)
		return
	}
	c.HTML(200, "index", data)
}

func (hs *HTTPServer) NotFoundHandler(c *models.ReqContext) {
	if c.IsApiRequest() {
		c.JsonApiErr(404, "Not found", nil)
		return
	}

	data, err := hs.setIndexViewData(c)
	if err != nil {
		c.Handle(hs.Cfg, 500, "Failed to get settings", err)
		return
	}

	c.HTML(404, "index", data)
}

func getAppNameBodyClass(validLicense bool) string {
	if validLicense {
		return "app-enterprise"
	}

	return "app-grafana"
}
