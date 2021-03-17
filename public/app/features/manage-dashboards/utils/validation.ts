import validationSrv from '../services/ValidationSrv';
import { getBackendSrv } from '@grafana/runtime';

export const validateDashboardJson = (json: string) => {
  try {
    JSON.parse(json);
    return true;
  } catch (error) {
    return 'Not valid JSON';
  }
};

export const validateGcomDashboard = (gcomDashboard: string) => {
  // From DashboardImportCtrl
  const match = /(^\d+$)|dashboards\/(\d+)/.exec(gcomDashboard);

  return match && (match[1] || match[2]) ? true : 'Could not find a valid Grafana.com id';
};

export const validateTitle = (newTitle: string, folderId: number) => {
  return validationSrv
    .validateNewDashboardName(folderId, newTitle)
    .then(() => {
      return true;
    })
    .catch((error) => {
      if (error.type === 'EXISTING') {
        return error.message;
      }
    });
};

export const validateUid = (value: string) => {
  return getBackendSrv()
    .get(`/api/dashboards/uid/${value}`)
    .then((existingDashboard) => {
      return `Tableau nommé '${existingDashboard?.dashboard.title}' dans le dossier '${existingDashboard?.meta.folderTitle}' avec le même uid`;
    })
    .catch((error) => {
      error.isHandled = true;
      return true;
    });
};
