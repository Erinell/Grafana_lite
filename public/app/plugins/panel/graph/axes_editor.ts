import { selectors } from '@grafana/e2e-selectors';
import { GraphCtrl } from './module';

export class AxesEditorCtrl {
  panel: any;
  panelCtrl: GraphCtrl;
  logScales: any;
  xAxisModes: any;
  xAxisStatOptions: any;
  xNameSegment: any;
  selectors: typeof selectors.components.Panels.Visualization.Graph.VisualizationTab;

  /** @ngInject */
  constructor(private $scope: any) {
    this.panelCtrl = $scope.ctrl as GraphCtrl;
    this.panel = this.panelCtrl.panel;
    this.$scope.ctrl = this;

    this.logScales = {
      linear: 1,
      'log (base 2)': 2,
      'log (base 10)': 10,
      'log (base 32)': 32,
      'log (base 1024)': 1024,
    };

    this.xAxisModes = {
      Time: 'temps',
      Series: 'series',
      Histogram: 'histogramme',
      // 'Data field': 'field',
    };

    this.xAxisStatOptions = [
      { text: 'Moy', value: 'avg' },
      { text: 'Min', value: 'min' },
      { text: 'Max', value: 'max' },
      { text: 'Total', value: 'total' },
      { text: 'Compte', value: 'count' },
      { text: 'Actuel', value: 'current' },
    ];

    if (this.panel.xaxis.mode === 'custom') {
      if (!this.panel.xaxis.name) {
        this.panel.xaxis.name = 'specifier';
      }
    }
    this.selectors = selectors.components.Panels.Visualization.Graph.VisualizationTab;
  }

  setUnitFormat(axis: { format: any }) {
    return (unit: string) => {
      axis.format = unit;
      // if already set via field config we need to update that as well
      if (this.panel.fieldConfig.defaults.unit) {
        this.panel.fieldConfig.defaults.unit = unit;
        this.panelCtrl.refresh();
      } else {
        this.panelCtrl.render();
      }
    };
  }

  render() {
    this.panelCtrl.render();
  }

  xAxisModeChanged() {
    this.panelCtrl.processor.setPanelDefaultsForNewXAxisMode();
    this.panelCtrl.onDataFramesReceived(this.panelCtrl.dataList);
  }

  xAxisValueChanged() {
    this.panelCtrl.onDataFramesReceived(this.panelCtrl.dataList);
  }
}

/** @ngInject */
export function axesEditorComponent() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/app/plugins/panel/graph/axes_editor.html',
    controller: AxesEditorCtrl,
  };
}
