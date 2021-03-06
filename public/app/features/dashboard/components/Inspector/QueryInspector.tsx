import React, { PureComponent } from 'react';
import { Button, JSONFormatter, LoadingPlaceholder } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import { AppEvents, DataFrame } from '@grafana/data';

import appEvents from 'app/core/app_events';
import { CopyToClipboard } from 'app/core/components/CopyToClipboard/CopyToClipboard';
import { PanelModel } from 'app/features/dashboard/state';
import { getPanelInspectorStyles } from './styles';
import { supportsDataQuery } from '../PanelEditor/utils';
import { config } from '@grafana/runtime';
import { css } from 'emotion';
import { Subscription } from 'rxjs';
import { backendSrv } from 'app/core/services/backend_srv';
import { RefreshEvent } from 'app/types/events';

interface DsQuery {
  isLoading: boolean;
  response: {};
}

interface ExecutedQueryInfo {
  refId: string;
  query: string;
  frames: number;
  rows: number;
}

interface Props {
  panel: PanelModel;
  data: DataFrame[];
}

interface State {
  allNodesExpanded: boolean | null;
  isMocking: boolean;
  mockedResponse: string;
  dsQuery: DsQuery;
  executedQueries: ExecutedQueryInfo[];
}

export class QueryInspector extends PureComponent<Props, State> {
  private formattedJson: any;
  private subs = new Subscription();

  constructor(props: Props) {
    super(props);
    this.state = {
      executedQueries: [],
      allNodesExpanded: null,
      isMocking: false,
      mockedResponse: '',
      dsQuery: {
        isLoading: false,
        response: {},
      },
    };
  }

  componentDidMount() {
    const { panel } = this.props;

    this.subs.add(
      backendSrv.getInspectorStream().subscribe({
        next: (response) => this.onDataSourceResponse(response),
      })
    );

    this.subs.add(panel.events.subscribe(RefreshEvent, this.onPanelRefresh));
    this.updateQueryList();
  }

  componentDidUpdate(oldProps: Props) {
    if (this.props.data !== oldProps.data) {
      this.updateQueryList();
    }
  }

  /**
   * Find the list of executed queries
   */
  updateQueryList() {
    const { data } = this.props;
    const executedQueries: ExecutedQueryInfo[] = [];

    if (data?.length) {
      let last: ExecutedQueryInfo | undefined = undefined;

      data.forEach((frame, idx) => {
        const query = frame.meta?.executedQueryString;

        if (query) {
          const refId = frame.refId || '?';

          if (last?.refId === refId) {
            last.frames++;
            last.rows += frame.length;
          } else {
            last = {
              refId,
              frames: 0,
              rows: frame.length,
              query,
            };
            executedQueries.push(last);
          }
        }
      });
    }

    this.setState({ executedQueries });
  }

  onIssueNewQuery = () => {
    this.props.panel.refresh();
  };

  componentWillUnmount() {
    this.subs.unsubscribe();
  }

  onPanelRefresh = () => {
    this.setState((prevState) => ({
      ...prevState,
      dsQuery: {
        isLoading: true,
        response: {},
      },
    }));
  };

  onDataSourceResponse(response: any) {
    // ignore silent requests
    if (response.config?.hideFromInspector) {
      return;
    }

    response = { ...response }; // clone - dont modify the response

    if (response.headers) {
      delete response.headers;
    }

    if (response.config) {
      response.request = response.config;

      delete response.config;
      delete response.request.transformRequest;
      delete response.request.transformResponse;
      delete response.request.paramSerializer;
      delete response.request.jsonpCallbackParam;
      delete response.request.headers;
      delete response.request.requestId;
      delete response.request.inspect;
      delete response.request.retry;
      delete response.request.timeout;
    }

    if (response.data) {
      response.response = response.data;

      delete response.config;
      delete response.data;
      delete response.status;
      delete response.statusText;
      delete response.ok;
      delete response.url;
      delete response.redirected;
      delete response.type;
      delete response.$$config;
    }

    this.setState((prevState) => ({
      ...prevState,
      dsQuery: {
        isLoading: false,
        response: response,
      },
    }));
  }

  setFormattedJson = (formattedJson: any) => {
    this.formattedJson = formattedJson;
  };

  getTextForClipboard = () => {
    return JSON.stringify(this.formattedJson, null, 2);
  };

  onClipboardSuccess = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  onToggleExpand = () => {
    this.setState((prevState) => ({
      ...prevState,
      allNodesExpanded: !this.state.allNodesExpanded,
    }));
  };

  onToggleMocking = () => {
    this.setState((prevState) => ({
      ...prevState,
      isMocking: !this.state.isMocking,
    }));
  };

  getNrOfOpenNodes = () => {
    if (this.state.allNodesExpanded === null) {
      return 3; // 3 is default, ie when state is null
    } else if (this.state.allNodesExpanded) {
      return 20;
    }
    return 1;
  };

  setMockedResponse = (evt: any) => {
    const mockedResponse = evt.target.value;
    this.setState((prevState) => ({
      ...prevState,
      mockedResponse,
    }));
  };

  renderExecutedQueries(executedQueries: ExecutedQueryInfo[]) {
    if (!executedQueries.length) {
      return null;
    }

    const styles = {
      refId: css`
        font-weight: ${config.theme.typography.weight.semibold};
        color: ${config.theme.colors.textBlue};
        margin-right: 8px;
      `,
    };

    return (
      <div>
        {executedQueries.map((info) => {
          return (
            <div key={info.refId}>
              <div>
                <span className={styles.refId}>{info.refId}:</span>
                {info.frames > 1 && <span>{info.frames} frames, </span>}
                <span>{info.rows} rows</span>
              </div>
              <pre>{info.query}</pre>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { allNodesExpanded, executedQueries } = this.state;
    const { response, isLoading } = this.state.dsQuery;
    const openNodes = this.getNrOfOpenNodes();
    const styles = getPanelInspectorStyles();
    const haveData = Object.keys(response).length > 0;

    if (!supportsDataQuery(this.props.panel.plugin)) {
      return null;
    }

    return (
      <>
        <div aria-label={selectors.components.PanelInspector.Query.content}>
          <h3 className="section-heading">Inspecteur de requ??tes</h3>
          <p className="small muted">
            L&apos;inspecteur vous permet d&apos;afficher la demande et la r??ponse brute. Pour collecter ces donn??es,
            Grafana doit ??mettre une nouvelle requ??te. Appuyez sur le bouton d&apos;actualisation ci-dessous pour
            d??clencher une nouvelle requ??te.
          </p>
        </div>
        {this.renderExecutedQueries(executedQueries)}
        <div className={styles.toolbar}>
          <Button
            icon="sync"
            onClick={this.onIssueNewQuery}
            aria-label={selectors.components.PanelInspector.Query.refreshButton}
          >
            Rafraichir
          </Button>

          {haveData && allNodesExpanded && (
            <Button icon="minus" variant="secondary" className={styles.toolbarItem} onClick={this.onToggleExpand}>
              R??duire tout
            </Button>
          )}
          {haveData && !allNodesExpanded && (
            <Button icon="plus" variant="secondary" className={styles.toolbarItem} onClick={this.onToggleExpand}>
              Etendre tout
            </Button>
          )}

          {haveData && (
            <CopyToClipboard
              text={this.getTextForClipboard}
              onSuccess={this.onClipboardSuccess}
              elType="div"
              className={styles.toolbarItem}
            >
              <Button icon="copy" variant="secondary">
                Copier
              </Button>
            </CopyToClipboard>
          )}
          <div className="flex-grow-1" />
        </div>
        <div className={styles.contentQueryInspector}>
          {isLoading && <LoadingPlaceholder text="Chargement..." />}
          {!isLoading && haveData && (
            <JSONFormatter json={response} open={openNodes} onDidRender={this.setFormattedJson} />
          )}
          {!isLoading && !haveData && <p className="muted">Aucune requ??te et r??ponse collect??es pour le moment.</p>}
        </div>
      </>
    );
  }
}
