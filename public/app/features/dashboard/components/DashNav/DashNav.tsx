// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
// Utils & Services
import { playlistSrv } from 'app/features/playlist/PlaylistSrv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { ButtonGroup, ModalsController, ToolbarButton, PageToolbar } from '@grafana/ui';
import { textUtil } from '@grafana/data';
// State
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardModel } from '../../state';
import { StoreState } from 'app/types';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { SaveDashboardModalProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardModalProxy';
import { locationService } from '@grafana/runtime';
import { toggleKioskMode } from 'app/core/navigation/kiosk';
import { getDashboardSrv } from '../../services/DashboardSrv';

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  onAddPanel: () => void;
}

interface DispatchProps {
  updateTimeZoneForSession: typeof updateTimeZoneForSession;
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
}

type Props = OwnProps & DispatchProps;

class DashNav extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onFolderNameClick = () => {
    locationService.partial({ search: 'open', folder: 'current' });
  };

  onClose = () => {
    locationService.partial({ viewPanel: null });
  };

  onToggleTVMode = () => {
    toggleKioskMode();
  };

  onOpenSettings = () => {
    locationService.partial({ editview: 'settings' });
  };

  onStarDashboard = () => {
    const { dashboard } = this.props;
    const dashboardSrv = getDashboardSrv();

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    playlistSrv.prev();
  };

  onPlaylistNext = () => {
    playlistSrv.next();
  };

  onPlaylistStop = () => {
    playlistSrv.stop();
    this.forceUpdate();
  };

  onDashboardNameClick = () => {
    locationService.partial({ search: 'open' });
  };

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  isInKioskMode() {
    // TODO fix this
    return false;
  }

  isPlaylistRunning() {
    return playlistSrv.isPlaying;
  }

  renderLeftActionsButton() {
    const { dashboard } = this.props;
    const { canStar, canShare, isStarred } = dashboard.meta;
    const buttons: ReactNode[] = [];

    if (this.isInKioskMode() || this.isPlaylistRunning()) {
      return [];
    }

    if (canStar) {
      buttons.push(
        <DashNavButton
          tooltip="Mettre en favoris"
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          onClick={this.onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare) {
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Partager le tableau ou panneau"
              icon="share-alt"
              iconSize="lg"
              onClick={() => {
                showModal(ShareModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    this.addCustomContent(customLeftActions, buttons);
    return buttons;
  }

  renderPlaylistControls() {
    return (
      <ButtonGroup key="playlist-buttons">
        <ToolbarButton tooltip="Aller au tableau pr??c??dent" icon="backward" onClick={this.onPlaylistPrev} narrow />
        <ToolbarButton onClick={this.onPlaylistStop}>Arreter playlist</ToolbarButton>
        <ToolbarButton tooltip="Aller au tableau suivant" icon="forward" onClick={this.onPlaylistNext} narrow />
      </ButtonGroup>
    );
  }

  renderRightActionsButton() {
    const { dashboard, onAddPanel, updateTimeZoneForSession, isFullscreen } = this.props;
    const { canEdit, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;
    const buttons: ReactNode[] = [];
    const tvButton = (
      <ToolbarButton tooltip="Mode vue cycle" icon="monitor" onClick={this.onToggleTVMode} key="tv-button" />
    );
    const timeControls = (
      <DashNavTimeControls dashboard={dashboard} onChangeTimeZone={updateTimeZoneForSession} key="time-controls" />
    );

    if (this.isPlaylistRunning()) {
      return [this.renderPlaylistControls(), timeControls];
    }

    if (this.isInKioskMode()) {
      return [timeControls, tvButton];
    }

    if (canEdit && !isFullscreen) {
      buttons.push(
        <ToolbarButton tooltip="Ajouter un tableau" icon="panel-add" onClick={onAddPanel} key="button-panel-add" />
      );
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <ToolbarButton
              tooltip="Sauvegarder"
              icon="save"
              onClick={() => {
                showModal(SaveDashboardModalProxy, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (snapshotUrl) {
      buttons.push(
        <ToolbarButton
          tooltip="Ouvrir le tableau original"
          onClick={() => this.gotoSnapshotOrigin(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings) {
      buttons.push(<ToolbarButton tooltip="Options" icon="cog" onClick={this.onOpenSettings} key="button-settings" />);
    }

    this.addCustomContent(customRightActions, buttons);

    if (!dashboard.timepicker.hidden) {
      buttons.push(timeControls);
    }

    buttons.push(tvButton);
    return buttons;
  }

  gotoSnapshotOrigin(snapshotUrl: string) {
    window.location.href = textUtil.sanitizeUrl(snapshotUrl);
  }

  render() {
    const { dashboard, isFullscreen } = this.props;
    const onGoBack = isFullscreen ? this.onClose : undefined;

    return (
      <PageToolbar
        pageIcon={isFullscreen ? undefined : 'apps'}
        title={dashboard.title}
        parent={dashboard.meta.folderTitle}
        onClickTitle={this.onDashboardNameClick}
        onClickParent={this.onFolderNameClick}
        onGoBack={onGoBack}
        leftItems={this.renderLeftActionsButton()}
      >
        {this.renderRightActionsButton()}
      </PageToolbar>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateTimeZoneForSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
