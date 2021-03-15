package api

import (
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
)

func StarDashboard(c *models.ReqContext) response.Response {
	cmd := models.StarDashboardCommand{UserId: c.UserId, DashboardId: c.ParamsInt64(":id")}

	if cmd.DashboardId <= 0 {
		return response.Error(400, "Manque id du tableau", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return response.Error(500, "Echec de mise en favoris", err)
	}

	return response.Success("Tableau mis en favoris !")
}

func UnstarDashboard(c *models.ReqContext) response.Response {
	cmd := models.UnstarDashboardCommand{UserId: c.UserId, DashboardId: c.ParamsInt64(":id")}

	if cmd.DashboardId <= 0 {
		return response.Error(400, "Manque id du tableau", nil)
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return response.Error(500, "Echec de retirage des favoris", err)
	}

	return response.Success("Tableau retiré des favoris")
}
