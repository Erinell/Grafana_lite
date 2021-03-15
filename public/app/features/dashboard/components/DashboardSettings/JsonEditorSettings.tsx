import React, { useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Button, CodeEditor } from '@grafana/ui';
import { dashboardWatcher } from 'app/features/live/dashboard/dashboardWatcher';
import { getDashboardSrv } from '../../services/DashboardSrv';
import { DashboardModel } from '../../state/DashboardModel';

interface Props {
  dashboard: DashboardModel;
}

export const JsonEditorSettings: React.FC<Props> = ({ dashboard }) => {
  const [dashboardJson, setDashboardJson] = useState<string>(JSON.stringify(dashboard.getSaveModelClone(), null, 2));
  const onBlur = (value: string) => {
    setDashboardJson(value);
  };
  const onClick = () => {
    getDashboardSrv()
      .saveJSONDashboard(dashboardJson)
      .then(() => {
        dashboardWatcher.reloadPage();
      });
  };

  return (
    <>
      <h3 className="dashboard-settings__header">Modèle JSON</h3>
      <div className="dashboard-settings__subheader">
        Le modèle JSON est la strucutre de données qui définissent le tableau. Inclus options, requêtes, options de
        panneaux etc.
      </div>

      <div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <CodeEditor
              value={dashboardJson}
              language="json"
              width={width}
              height="500px"
              showMiniMap={false}
              onBlur={onBlur}
            />
          )}
        </AutoSizer>
      </div>
      {dashboard.meta.canSave && (
        <Button className="m-t-3" onClick={onClick}>
          Sauvegarder
        </Button>
      )}
    </>
  );
};
