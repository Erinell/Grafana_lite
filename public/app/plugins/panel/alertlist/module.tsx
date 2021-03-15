import React from 'react';
import { PanelPlugin } from '@grafana/data';
import { TagsInput } from '@grafana/ui';
import { AlertList } from './AlertList';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import { AlertListOptions, ShowOption, SortOrder } from './types';
import { alertListPanelMigrationHandler } from './AlertListMigrationHandler';

function showIfCurrentState(options: AlertListOptions) {
  return options.showOptions === ShowOption.Current;
}

export const plugin = new PanelPlugin<AlertListOptions>(AlertList)
  .setPanelOptions((builder) => {
    builder
      .addSelect({
        name: 'Show',
        path: 'showOptions',
        settings: {
          options: [
            { label: 'Current state', value: ShowOption.Current },
            { label: 'Recent state changes', value: ShowOption.RecentChanges },
          ],
        },
        defaultValue: ShowOption.Current,
        category: ['Options'],
      })
      .addNumberInput({
        name: 'Max items',
        path: 'maxItems',
        defaultValue: 10,
        category: ['Options'],
      })
      .addSelect({
        name: 'Sort order',
        path: 'sortOrder',
        settings: {
          options: [
            { label: 'alphabétique (asc)', value: SortOrder.AlphaAsc },
            { label: 'alphabétique (desc)', value: SortOrder.AlphaDesc },
            { label: 'Importance', value: SortOrder.Importance },
            { label: 'Time (asc)', value: SortOrder.TimeAsc },
            { label: 'Time (desc)', value: SortOrder.TimeDesc },
          ],
        },
        defaultValue: SortOrder.AlphaAsc,
        category: ['Options'],
      })
      .addBooleanSwitch({
        path: 'dashboardAlerts',
        name: 'Alertes de ce tableau',
        defaultValue: false,
        category: ['Options'],
      })
      .addTextInput({
        path: 'alertName',
        name: 'Nom alerte',
        defaultValue: '',
        category: ['Filter'],
        showIf: showIfCurrentState,
      })
      .addTextInput({
        path: 'dashboardTitle',
        name: 'Titre tableau',
        defaultValue: '',
        category: ['Filter'],
        showIf: showIfCurrentState,
      })
      .addCustomEditor({
        path: 'folderId',
        name: 'Dossier',
        id: 'folderId',
        defaultValue: null,
        editor: function RenderFolderPicker(props) {
          return (
            <FolderPicker
              initialFolderId={props.value}
              initialTitle="All"
              enableReset={true}
              onChange={({ id }) => props.onChange(id)}
            />
          );
        },
        category: ['Filter'],
        showIf: showIfCurrentState,
      })
      .addCustomEditor({
        id: 'tags',
        path: 'tags',
        name: 'Tags',
        description: '',
        defaultValue: [],
        editor(props) {
          return <TagsInput tags={props.value} onChange={props.onChange} />;
        },
        category: ['Filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.ok',
        name: 'Ok',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.paused',
        name: 'Pause',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.no_data',
        name: 'No data',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.execution_error',
        name: 'Execution error',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.alerting',
        name: 'Alerting',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      })
      .addBooleanSwitch({
        path: 'stateFilter.pending',
        name: 'Pending',
        defaultValue: false,
        category: ['State filter'],
        showIf: showIfCurrentState,
      });
  })
  .setMigrationHandler(alertListPanelMigrationHandler);
