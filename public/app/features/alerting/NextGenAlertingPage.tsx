import React, { FormEvent, PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect, ConnectedProps } from 'react-redux';
import { css } from 'emotion';
import { GrafanaTheme, SelectableValue } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { PageToolbar, stylesFactory, ToolbarButton } from '@grafana/ui';
import { config } from 'app/core/config';
import { SplitPaneWrapper } from 'app/core/components/SplitPaneWrapper/SplitPaneWrapper';
import { AlertingQueryEditor } from './components/AlertingQueryEditor';
import { AlertDefinitionOptions } from './components/AlertDefinitionOptions';
import { AlertingQueryPreview } from './components/AlertingQueryPreview';
import {
  cleanUpDefinitionState,
  createAlertDefinition,
  evaluateAlertDefinition,
  evaluateNotSavedAlertDefinition,
  getAlertDefinition,
  onRunQueries,
  updateAlertDefinition,
  updateAlertDefinitionOption,
  updateAlertDefinitionUiState,
} from './state/actions';
import { StoreState } from 'app/types';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

function mapStateToProps(state: StoreState, props: RouteProps) {
  return {
    uiState: state.alertDefinition.uiState,
    getQueryOptions: state.alertDefinition.getQueryOptions,
    queryRunner: state.alertDefinition.queryRunner,
    getInstances: state.alertDefinition.getInstances,
    alertDefinition: state.alertDefinition.alertDefinition,
    pageId: props.match.params.id as string,
  };
}

const mapDispatchToProps = {
  updateAlertDefinitionUiState,
  updateAlertDefinitionOption,
  evaluateAlertDefinition,
  updateAlertDefinition,
  createAlertDefinition,
  getAlertDefinition,
  evaluateNotSavedAlertDefinition,
  onRunQueries,
  cleanUpDefinitionState,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

interface RouteProps extends GrafanaRouteComponentProps<{ id: string }> {}

interface OwnProps {
  saveDefinition: typeof createAlertDefinition | typeof updateAlertDefinition;
}

type Props = OwnProps & ConnectedProps<typeof connector>;

class NextGenAlertingPageUnconnected extends PureComponent<Props> {
  componentDidMount() {
    const { getAlertDefinition, pageId } = this.props;

    if (pageId) {
      getAlertDefinition(pageId);
    }
  }

  componentWillUnmount() {
    this.props.cleanUpDefinitionState();
  }

  onChangeAlertOption = (event: FormEvent<HTMLElement>) => {
    const formEvent = event as FormEvent<HTMLFormElement>;
    this.props.updateAlertDefinitionOption({ [formEvent.currentTarget.name]: formEvent.currentTarget.value });
  };

  onChangeInterval = (interval: SelectableValue<number>) => {
    this.props.updateAlertDefinitionOption({
      intervalSeconds: interval.value,
    });
  };

  onConditionChange = (condition: SelectableValue<string>) => {
    this.props.updateAlertDefinitionOption({
      condition: condition.value,
    });
  };

  onSaveAlert = () => {
    const { alertDefinition, createAlertDefinition, updateAlertDefinition } = this.props;

    if (alertDefinition.uid) {
      updateAlertDefinition();
    } else {
      createAlertDefinition();
    }
  };

  onDiscard = () => {
    locationService.replace(`${config.appSubUrl}/alerting/list`);
  };

  onTest = () => {
    const { alertDefinition, evaluateAlertDefinition, evaluateNotSavedAlertDefinition } = this.props;
    if (alertDefinition.uid) {
      evaluateAlertDefinition();
    } else {
      evaluateNotSavedAlertDefinition();
    }
  };

  renderToolbarActions() {
    return [
      <ToolbarButton variant="destructive" key="discard" onClick={this.onDiscard}>
        Rejeter
      </ToolbarButton>,
      <ToolbarButton key="test" onClick={this.onTest}>
        Test
      </ToolbarButton>,
      <ToolbarButton variant="primary" key="save" onClick={this.onSaveAlert}>
        Sauvegarder
      </ToolbarButton>,
    ];
  }

  render() {
    const {
      alertDefinition,
      uiState,
      updateAlertDefinitionUiState,
      getQueryOptions,
      getInstances,
      onRunQueries,
      queryRunner,
    } = this.props;

    const styles = getStyles(config.theme);
    const queryOptions = getQueryOptions();

    return (
      <div className={styles.wrapper}>
        <PageToolbar title="Alert editor" pageIcon="bell">
          {this.renderToolbarActions()}
        </PageToolbar>
        <div className={styles.splitPanesWrapper}>
          <SplitPaneWrapper
            leftPaneComponents={[
              <AlertingQueryPreview
                key="queryPreview"
                onTest={this.onTest}
                queries={queryOptions.queries}
                getInstances={getInstances}
                queryRunner={queryRunner!}
                onRunQueries={onRunQueries}
              />,
              <AlertingQueryEditor key="queryEditor" />,
            ]}
            uiState={uiState}
            updateUiState={updateAlertDefinitionUiState}
            rightPaneComponents={
              <AlertDefinitionOptions
                alertDefinition={alertDefinition}
                onChange={this.onChangeAlertOption}
                onIntervalChange={this.onChangeInterval}
                onConditionChange={this.onConditionChange}
                queryOptions={queryOptions}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default hot(module)(connector(NextGenAlertingPageUnconnected));

const getStyles = stylesFactory((theme: GrafanaTheme) => ({
  wrapper: css`
    width: calc(100% - 55px);
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    background: ${theme.colors.dashboardBg};
    display: flex;
    flex-direction: column;
  `,
  splitPanesWrapper: css`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
  `,
}));
