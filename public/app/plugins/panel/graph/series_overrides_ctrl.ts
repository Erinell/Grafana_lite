import _ from 'lodash';
import coreModule from 'app/core/core_module';
import { textUtil } from '@grafana/data';

/** @ngInject */
export function SeriesOverridesCtrl($scope: any, $element: JQuery, popoverSrv: any) {
  $scope.overrideMenu = [];
  $scope.currentOverrides = [];
  $scope.override = $scope.override || {};
  $scope.colorPickerModel = {};

  $scope.addOverrideOption = (name: string, propertyName: string, values: any) => {
    const option = {
      text: name,
      propertyName: propertyName,
      index: $scope.overrideMenu.length,
      values,
      submenu: _.map(values, (value) => {
        return { text: String(value), value: value };
      }),
    };

    $scope.overrideMenu.push(option);
  };

  $scope.setOverride = (item: { propertyName: string }, subItem: { value: any }) => {
    // handle color overrides
    if (item.propertyName === 'color') {
      $scope.openColorSelector($scope.override['color']);
      return;
    }

    $scope.override[item.propertyName] = subItem.value;

    // automatically disable lines for this series and the fill below to series
    // can be removed by the user if they still want lines
    if (item.propertyName === 'fillBelowTo') {
      $scope.override['lines'] = false;
      $scope.ctrl.addSeriesOverride({ alias: subItem.value, lines: false });
    }

    $scope.updateCurrentOverrides();
    $scope.ctrl.render();
  };

  $scope.colorSelected = (color: any) => {
    $scope.override['color'] = color;
    $scope.updateCurrentOverrides();
    $scope.ctrl.render();

    // update picker model so that the picker UI will also update
    $scope.colorPickerModel.series.color = color;
  };

  $scope.openColorSelector = (color: any) => {
    $scope.colorPickerModel = {
      autoClose: true,
      colorSelected: $scope.colorSelected,
      series: { color },
    };

    popoverSrv.show({
      element: $element.find('.dropdown')[0],
      position: 'top center',
      openOn: 'click',
      template: '<series-color-picker-popover color="series.color" onColorChange="colorSelected" />',
      classNames: 'drop-popover drop-popover--transparent',
      model: $scope.colorPickerModel,
      onClose: () => {
        $scope.ctrl.render();
      },
    });
  };

  $scope.removeOverride = (option: { propertyName: string | number }) => {
    delete $scope.override[option.propertyName];
    $scope.updateCurrentOverrides();
    $scope.ctrl.refresh();
  };

  $scope.getSeriesNames = () => {
    return _.map($scope.ctrl.seriesList, (series) => {
      return textUtil.escapeHtml(series.alias);
    });
  };

  $scope.updateCurrentOverrides = () => {
    $scope.currentOverrides = [];
    _.each($scope.overrideMenu, (option) => {
      const value = $scope.override[option.propertyName];
      if (_.isUndefined(value)) {
        return;
      }
      $scope.currentOverrides.push({
        name: option.text,
        propertyName: option.propertyName,
        value: String(value),
      });
    });
  };

  $scope.addOverrideOption('Barres', 'bars', [true, false]);
  $scope.addOverrideOption('Lignes', 'lines', [true, false]);
  $scope.addOverrideOption('Remplissage ligne', 'fill', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  $scope.addOverrideOption('Remplissage gradiant', 'fillGradient', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  $scope.addOverrideOption('Epaisseur ligne', 'linewidth', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  $scope.addOverrideOption('Mode point nul', 'nullPointMode', ['connected', 'null', 'null as zero']);
  $scope.addOverrideOption('Remplir sous', 'fillBelowTo', $scope.getSeriesNames());
  $scope.addOverrideOption('Ligne escalier', 'steppedLine', [true, false]);
  $scope.addOverrideOption('Tirets', 'dashes', [true, false]);
  $scope.addOverrideOption('S??ries cach??es', 'hiddenSeries', [true, false]);
  $scope.addOverrideOption('Longueur tiret', 'dashLength', [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
  ]);
  $scope.addOverrideOption('Espace tiret', 'spaceLength', [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
  ]);
  $scope.addOverrideOption('Points', 'points', [true, false]);
  $scope.addOverrideOption('Taille points', 'pointradius', [1, 2, 3, 4, 5]);
  $scope.addOverrideOption('Empiler', 'stack', [true, false, 'A', 'B', 'C', 'D']);
  $scope.addOverrideOption('Couleur', 'color', ['change']);
  $scope.addOverrideOption('Axe Y', 'yaxis', [1, 2]);
  $scope.addOverrideOption('Index Z', 'zindex', [-3, -2, -1, 0, 1, 2, 3]);
  $scope.addOverrideOption('Transformer', 'transform', ['constant', 'negative-Y']);
  $scope.addOverrideOption('L??gende', 'legend', [true, false]);
  $scope.addOverrideOption('Cacher en infobulle', 'hideTooltip', [true, false]);
  $scope.updateCurrentOverrides();
}

coreModule.controller('SeriesOverridesCtrl', SeriesOverridesCtrl);
