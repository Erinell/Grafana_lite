import React, { useState } from 'react';
import { SelectableValue, TimeZone } from '@grafana/data';
import { Select, TagsInput, Input, Field, CollapsableSection, RadioButtonGroup } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import { DashboardModel } from '../../state/DashboardModel';
import { DeleteDashboardButton } from '../DeleteDashboard/DeleteDashboardButton';
import { TimePickerSettings } from './TimePickerSettings';

interface Props {
  dashboard: DashboardModel;
}

const GRAPH_TOOLTIP_OPTIONS = [
  { value: 0, label: 'Défaut' },
  { value: 1, label: 'Réticule partagé' },
  { value: 2, label: 'Info-bulle partagée' },
];

export const GeneralSettings: React.FC<Props> = ({ dashboard }) => {
  const [renderCounter, setRenderCounter] = useState(0);

  const onFolderChange = (folder: { id: number; title: string }) => {
    dashboard.meta.folderId = folder.id;
    dashboard.meta.folderTitle = folder.title;
    dashboard.meta.hasUnsavedFolderChange = true;
  };

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    dashboard[event.currentTarget.name as 'title' | 'description'] = event.currentTarget.value;
  };

  const onTooltipChange = (graphTooltip: SelectableValue<number>) => {
    dashboard.graphTooltip = graphTooltip.value;
    setRenderCounter(renderCounter + 1);
  };

  const onRefreshIntervalChange = (intervals: string[]) => {
    dashboard.timepicker.refresh_intervals = intervals.filter((i) => i.trim() !== '');
  };

  const onNowDelayChange = (nowDelay: string) => {
    dashboard.timepicker.nowDelay = nowDelay;
  };

  const onHideTimePickerChange = (hide: boolean) => {
    dashboard.timepicker.hidden = hide;
    setRenderCounter(renderCounter + 1);
  };

  const onTimeZoneChange = (timeZone: TimeZone) => {
    dashboard.timezone = timeZone;
    setRenderCounter(renderCounter + 1);
  };

  const onTagsChange = (tags: string[]) => {
    dashboard.tags = tags;
  };

  const onEditableChange = (value: boolean) => {
    dashboard.editable = value;
    setRenderCounter(renderCounter + 1);
  };

  const editableOptions = [
    { label: 'Editable', value: true },
    { label: 'Lecture', value: false },
  ];

  return (
    <div style={{ maxWidth: '600px' }}>
      <h3 className="dashboard-settings__header" aria-label={selectors.pages.Dashboard.Settings.General.title}>
        General
      </h3>
      <div className="gf-form-group">
        <Field label="Nom">
          <Input name="title" onBlur={onBlur} defaultValue={dashboard.title} />
        </Field>
        <Field label="Description">
          <Input name="description" onBlur={onBlur} defaultValue={dashboard.description} />
        </Field>
        <Field label="Tags">
          <TagsInput tags={dashboard.tags} onChange={onTagsChange} />
        </Field>
        <Field label="Dossiers">
          <FolderPicker
            initialTitle={dashboard.meta.folderTitle}
            initialFolderId={dashboard.meta.folderId}
            onChange={onFolderChange}
            enableCreateNew={true}
            dashboardId={dashboard.id}
          />
        </Field>

        <Field
          label="Editable"
          description="Mettre en mode lecture pour désactiver l'édition. Relancer le tableau pour prendre effet."
        >
          <RadioButtonGroup value={dashboard.editable} options={editableOptions} onChange={onEditableChange} />
        </Field>
      </div>

      <TimePickerSettings
        onTimeZoneChange={onTimeZoneChange}
        onRefreshIntervalChange={onRefreshIntervalChange}
        onNowDelayChange={onNowDelayChange}
        onHideTimePickerChange={onHideTimePickerChange}
        refreshIntervals={dashboard.timepicker.refresh_intervals}
        timePickerHidden={dashboard.timepicker.hidden}
        nowDelay={dashboard.timepicker.nowDelay}
        timezone={dashboard.timezone}
      />

      <CollapsableSection label="Options panneau" isOpen={true}>
        <Field
          label="Infobulle graphique"
          description="Contrôle le comportement de l'infobulle et du survol des différents panneaux"
        >
          <Select
            onChange={onTooltipChange}
            options={GRAPH_TOOLTIP_OPTIONS}
            width={40}
            value={dashboard.graphTooltip}
          />
        </Field>
      </CollapsableSection>

      <div className="gf-form-button-row">
        {dashboard.meta.canSave && <DeleteDashboardButton dashboard={dashboard} />}
      </div>
    </div>
  );
};
