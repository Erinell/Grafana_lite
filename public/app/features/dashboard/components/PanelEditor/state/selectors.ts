import memoizeOne from 'memoize-one';
import { PanelPlugin } from '@grafana/data';
import { PanelEditorTab, PanelEditorTabId } from '../types';
import { getConfig } from 'app/core/config';

export const getPanelEditorTabs = memoizeOne((tab?: string, plugin?: PanelPlugin) => {
  const tabs: PanelEditorTab[] = [];

  if (!plugin) {
    return tabs;
  }

  let defaultTab = PanelEditorTabId.Visualize;

  if (plugin.meta.skipDataQuery) {
    return [];
  }

  if (!plugin.meta.skipDataQuery) {
    defaultTab = PanelEditorTabId.Query;

    tabs.push({
      id: PanelEditorTabId.Query,
      text: 'Requêtes',
      icon: 'database',
      active: false,
    });

    tabs.push({
      id: PanelEditorTabId.Transform,
      text: 'Transformations',
      icon: 'process',
      active: false,
    });
  }

  if (getConfig().alertingEnabled && plugin.meta.id === 'graph') {
    tabs.push({
      id: PanelEditorTabId.Alert,
      text: 'Alertes',
      icon: 'bell',
      active: false,
    });
  }

  const activeTab = tabs.find((item) => item.id === (tab || defaultTab)) ?? tabs[0];
  activeTab.active = true;

  return tabs;
});
