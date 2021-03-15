// Libraries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';
// Components
import Page from 'app/core/components/Page/Page';
import OrgActionBar from 'app/core/components/OrgActionBar/OrgActionBar';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import DataSourcesList from './DataSourcesList';
// Types
import { DataSourceSettings, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import { StoreState } from 'app/types';
import { LayoutMode } from 'app/core/components/LayoutSelector/LayoutSelector';
// Actions
import { loadDataSources } from './state/actions';
import { getNavModel } from 'app/core/selectors/navModel';

import {
  getDataSources,
  getDataSourcesCount,
  getDataSourcesLayoutMode,
  getDataSourcesSearchQuery,
} from './state/selectors';
import { setDataSourcesLayoutMode, setDataSourcesSearchQuery } from './state/reducers';

export interface Props {
  navModel: NavModel;
  dataSources: DataSourceSettings[];
  dataSourcesCount: number;
  layoutMode: LayoutMode;
  searchQuery: string;
  hasFetched: boolean;
  loadDataSources: typeof loadDataSources;
  setDataSourcesLayoutMode: typeof setDataSourcesLayoutMode;
  setDataSourcesSearchQuery: typeof setDataSourcesSearchQuery;
}

const emptyListModel = {
  title: "Il n'y à pas encore de source ici.",
  buttonIcon: 'database' as IconName,
  buttonLink: 'datasources/new',
  buttonTitle: 'Ajouter une source',
  proTip: 'Vous pouvez aussi définir une source de données avec le fichier configuration.',
  proTipLink: 'http://docs.grafana.org/administration/provisioning/#datasources?utm_source=grafana_ds_list',
  proTipLinkTitle: 'Lire plus',
  proTipTarget: '_blank',
};

export class DataSourcesListPage extends PureComponent<Props> {
  componentDidMount() {
    this.props.loadDataSources();
  }

  render() {
    const {
      dataSources,
      dataSourcesCount,
      navModel,
      layoutMode,
      searchQuery,
      setDataSourcesSearchQuery,
      hasFetched,
    } = this.props;

    const linkButton = {
      href: 'datasources/new',
      title: 'Ajouter une source',
    };

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            {hasFetched && dataSourcesCount === 0 && <EmptyListCTA {...emptyListModel} />}
            {hasFetched &&
              dataSourcesCount > 0 && [
                <OrgActionBar
                  searchQuery={searchQuery}
                  setSearchQuery={(query) => setDataSourcesSearchQuery(query)}
                  linkButton={linkButton}
                  key="action-bar"
                />,
                <DataSourcesList dataSources={dataSources} layoutMode={layoutMode} key="list" />,
              ]}
          </>
        </Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'datasources'),
    dataSources: getDataSources(state.dataSources),
    layoutMode: getDataSourcesLayoutMode(state.dataSources),
    dataSourcesCount: getDataSourcesCount(state.dataSources),
    searchQuery: getDataSourcesSearchQuery(state.dataSources),
    hasFetched: state.dataSources.hasFetched,
  };
}

const mapDispatchToProps = {
  loadDataSources,
  setDataSourcesSearchQuery,
  setDataSourcesLayoutMode,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(DataSourcesListPage));
