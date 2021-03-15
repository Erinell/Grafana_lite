import angular, { ILocationService, IScope } from 'angular';

import { DashboardModel } from '../../state/DashboardModel';
import { DecoratedRevisionModel } from '../DashboardSettings/VersionsSettings';
import { CalculateDiffOptions, HistorySrv } from './HistorySrv';
import { AppEvents, locationUtil } from '@grafana/data';
import { GrafanaRootScope } from 'app/routes/GrafanaCtrl';
import { promiseToDigest } from '../../../../core/utils/promiseToDigest';
import { ShowConfirmModalEvent } from '../../../../types/events';
import { appEvents } from 'app/core/core';

export class HistoryListCtrl {
  dashboard: DashboardModel;
  delta: { basic: string; json: string };
  diff: string;
  loading: boolean;
  newInfo: DecoratedRevisionModel;
  baseInfo: DecoratedRevisionModel;
  isNewLatest: boolean;
  onFetchFail: () => void;

  /** @ngInject */
  constructor(
    private $route: any,
    private $rootScope: GrafanaRootScope,
    private $location: ILocationService,
    private historySrv: HistorySrv,
    public $scope: IScope
  ) {
    this.diff = 'basic';
    this.loading = false;
  }
  getDiff(diff: 'basic' | 'json') {
    this.diff = diff;

    // has it already been fetched?
    if (this.delta[diff]) {
      return Promise.resolve(this.delta[diff]);
    }

    this.loading = true;
    const options: CalculateDiffOptions = {
      new: {
        dashboardId: this.dashboard.id,
        version: this.newInfo.version,
      },
      base: {
        dashboardId: this.dashboard.id,
        version: this.baseInfo.version,
      },
      diffType: diff,
    };

    return promiseToDigest(this.$scope)(
      this.historySrv
        .calculateDiff(options)
        .then((response: any) => {
          // @ts-ignore
          this.delta[this.diff] = response;
        })
        .catch(this.onFetchFail)
        .finally(() => {
          this.loading = false;
        })
    );
  }

  restore(version: number) {
    appEvents.publish(
      new ShowConfirmModalEvent({
        title: 'Restorer version',
        text: '',
        text2: `Êtes-vous sûr de vouloir restorer le tableau version ${version} ? Modifications non sauvegardées supprimées.`,
        icon: 'history',
        yesText: `Oui, restorer la version ${version}`,
        onConfirm: this.restoreConfirm.bind(this, version),
      })
    );
  }

  restoreConfirm(version: number) {
    this.loading = true;
    return promiseToDigest(this.$scope)(
      this.historySrv
        .restoreDashboard(this.dashboard, version)
        .then((response: any) => {
          this.$location.url(locationUtil.stripBaseFromUrl(response.url)).replace();
          this.$route.reload();
          this.$rootScope.appEvent(AppEvents.alertSuccess, ['Dashboard restored', 'Restored from version ' + version]);
        })
        .catch(() => {
          this.loading = false;
        })
    );
  }
}

export function dashboardHistoryDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/VersionHistory/template.html',
    controller: HistoryListCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
      delta: '=',
      baseInfo: '=baseinfo',
      newInfo: '=newinfo',
      isNewLatest: '=isnewlatest',
      onFetchFail: '=onfetchfail',
    },
  };
}

angular.module('grafana.directives').directive('gfDashboardHistory', dashboardHistoryDirective);
