import angular from 'angular';
import _ from 'lodash';
import $ from 'jquery';
import coreModule from 'app/core/core_module';
import { DashboardModel } from 'app/features/dashboard/state';
import DatasourceSrv from '../plugins/datasource_srv';
import appEvents from 'app/core/app_events';
import { AnnotationQuery, AppEvents } from '@grafana/data';

// Registeres the angular directive
import './components/StandardAnnotationQueryEditor';

export class AnnotationsEditorCtrl {
  mode: any;
  datasources: any;
  currentAnnotation: any;
  currentDatasource: any;
  currentIsNew: any;
  dashboard: DashboardModel;

  annotationDefaults: any = {
    name: '',
    datasource: null,
    iconColor: 'rgba(255, 96, 96, 1)',
    enable: true,
    showIn: 0,
    hide: false,
  };

  emptyListCta = {
    title: "Pas d'annotations pour le moment",
    buttonIcon: 'comment-alt',
    buttonTitle: 'Ajouter ',
    infoBox: {
      __html: `<p>Les annotations permettent d'intégrer des données d'évenement dans vos graphiques. Elles sont
      visualisées sous forme de lignes verticales et d'icônes sur tous les panneaux graphiques. Quand vous
      survolez une icône d'annotation, vous pouvez obtenir le text et les balises del'évènement. 
      Vous pouvez ajouter des évènements d'annotation directement à partir de grafana en maintenant CTRL ou CMD + clique 
      sur le graphique (ou zone de déplacement). Celles-ci sernt stockées dans la base de donnée d'annotations de Gragana.
  </p>
  Voir
  <a class='external-link' target='_blank' href='http://docs.grafana.org/reference/annotations/'
    >la documentation des annotations</a
  >
  pour plus d'information.`,
    },
    infoBoxTitle: 'Que sont les annotations ?',
  };

  showOptions: any = [
    { text: 'All Panels', value: 0 },
    { text: 'Specific Panels', value: 1 },
  ];

  /** @ngInject */
  constructor(private $scope: any, private datasourceSrv: DatasourceSrv) {
    $scope.ctrl = this;

    this.dashboard = $scope.dashboard;
    this.mode = 'list';
    this.datasources = datasourceSrv.getAnnotationSources();
    this.dashboard.annotations.list = this.dashboard.annotations.list ?? [];
    this.reset();

    this.onColorChange = this.onColorChange.bind(this);
  }

  async datasourceChanged() {
    const newDatasource = await this.datasourceSrv.get(this.currentAnnotation.datasource);
    this.$scope.$apply(() => {
      this.currentDatasource = newDatasource;
    });
  }

  /**
   * Called from the react editor
   */
  onAnnotationChange = (annotation: AnnotationQuery) => {
    let replaced = false;

    this.dashboard.annotations.list = this.dashboard.annotations.list.map((a) => {
      if (a.name !== annotation.name) {
        return a;
      }
      replaced = true;
      return annotation;
    });

    if (!replaced) {
      console.warn('updating annotatoin, but not in the dashboard', annotation);
    }

    this.currentAnnotation = annotation;
  };

  edit(annotation: AnnotationQuery) {
    this.currentAnnotation = annotation;
    this.currentAnnotation.showIn = this.currentAnnotation.showIn || 0;
    this.currentIsNew = false;
    this.datasourceChanged();
    this.mode = 'edit';
    $('.tooltip.in').remove();
  }

  reset() {
    this.currentAnnotation = angular.copy(this.annotationDefaults);
    this.currentAnnotation.datasource = this.datasources[0].name;
    this.currentIsNew = true;
    this.datasourceChanged();
  }

  update() {
    this.dashboard.annotations.list = [...this.dashboard.annotations.list];
    this.reset();
    this.mode = 'list';
  }

  setupNew = () => {
    this.mode = 'new';
    this.reset();
  };

  backToList() {
    this.mode = 'list';
  }

  move(index: number, dir: number) {
    const list = [...this.dashboard.annotations.list];
    Array.prototype.splice.call(list, index + dir, 0, Array.prototype.splice.call(list, index, 1)[0]);
    this.dashboard.annotations.list = list;
  }

  add() {
    const sameName: any = _.find(this.dashboard.annotations.list, { name: this.currentAnnotation.name });
    if (sameName) {
      appEvents.emit(AppEvents.alertWarning, ['Validation', 'Annotations with the same name already exists']);
      return;
    }
    this.dashboard.annotations.list = [...this.dashboard.annotations.list, this.currentAnnotation];
    this.reset();
    this.mode = 'list';
    this.dashboard.updateSubmenuVisibility();
  }

  removeAnnotation(annotation: AnnotationQuery) {
    this.dashboard.annotations.list = this.dashboard.annotations.list.filter((a) => {
      return a.name !== annotation.name;
    });
    this.dashboard.updateSubmenuVisibility();
  }

  onColorChange(newColor: string) {
    this.currentAnnotation.iconColor = newColor;
  }
}

coreModule.controller('AnnotationsEditorCtrl', AnnotationsEditorCtrl);
