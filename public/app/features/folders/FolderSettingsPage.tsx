import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { LegacyForms } from '@grafana/ui';
const { Input } = LegacyForms;
import Page from 'app/core/components/Page/Page';
import appEvents from 'app/core/app_events';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';
import { deleteFolder, getFolderByUid, saveFolder } from './state/actions';
import { getLoadingNav } from './state/navModel';
import { setFolderTitle } from './state/reducers';
import { ShowConfirmModalEvent } from '../../types/events';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

export interface OwnProps extends GrafanaRouteComponentProps<{ uid: string }> {}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const uid = props.match.params.uid;
  return {
    navModel: getNavModel(state.navIndex, `folder-settings-${uid}`, getLoadingNav(2)),
    folderUid: uid,
    folder: state.folder,
  };
};

const mapDispatchToProps = {
  getFolderByUid,
  saveFolder,
  setFolderTitle,
  deleteFolder,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export interface State {
  isLoading: boolean;
}

export class FolderSettingsPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    this.props.getFolderByUid(this.props.folderUid);
  }

  onTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.setFolderTitle(evt.target.value);
  };

  onSave = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({ isLoading: true });
    await this.props.saveFolder(this.props.folder);
    this.setState({ isLoading: false });
  };

  onDelete = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    evt.preventDefault();

    appEvents.publish(
      new ShowConfirmModalEvent({
        title: 'Delete',
        text: `Do you want to delete this folder and all its dashboards?`,
        icon: 'trash-alt',
        yesText: 'Delete',
        onConfirm: () => {
          this.props.deleteFolder(this.props.folder.uid);
        },
      })
    );
  };

  render() {
    const { navModel, folder } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          <h3 className="page-sub-heading">Options de dossiers</h3>

          <div className="section gf-form-group">
            <form name="folderSettingsForm" onSubmit={this.onSave}>
              <div className="gf-form">
                <label className="gf-form-label width-7">Nom</label>
                <Input
                  type="text"
                  className="gf-form-input width-30"
                  value={folder.title}
                  onChange={this.onTitleChange}
                />
              </div>
              <div className="gf-form-button-row">
                <button type="submit" className="btn btn-primary" disabled={!folder.canSave || !folder.hasChanged}>
                  Sauvegarder
                </button>
                <button className="btn btn-danger" onClick={this.onDelete} disabled={!folder.canSave}>
                  Supprimer
                </button>
              </div>
            </form>
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(FolderSettingsPage);
