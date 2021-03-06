import React, { FC, useState } from 'react';
import { MapStateToProps, connect } from 'react-redux';
import { NavModel, SelectableValue, urlUtil } from '@grafana/data';
import Page from 'app/core/components/Page/Page';
import { StoreState } from 'app/types';
import { GrafanaRouteComponentProps } from '../../core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { useAsync } from 'react-use';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { PlaylistDTO } from './types';
import { Button, Card, Checkbox, Field, LinkButton, Modal, RadioButtonGroup, VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import OrgActionBar from 'app/core/components/OrgActionBar/OrgActionBar';
import EmptyListCTA from '../../core/components/EmptyListCTA/EmptyListCTA';

interface ConnectedProps {
  navModel: NavModel;
}

interface Props extends ConnectedProps, GrafanaRouteComponentProps {}

export const PlaylistPage: FC<Props> = ({ navModel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startPlaylist, setStartPlaylist] = useState<PlaylistDTO | undefined>();

  const { value: playlists, loading } = useAsync(async () => {
    return getBackendSrv().get('/api/playlists', { query: searchQuery }) as Promise<PlaylistDTO[]>;
  });
  const hasPlaylists = playlists && playlists.length > 0;

  let content = (
    <EmptyListCTA
      title="Il n'y a pas de playlists pour le moment"
      buttonIcon="plus"
      buttonLink="playlists/create"
      buttonTitle="Créer une playlist"
      proTip="Vous pouvez utiliser les playlists pour faire un cycle de tableaux sur une TV sans contrôle"
      proTipLink="http://docs.grafana.org/reference/playlist/"
      proTipLinkTitle="En savoir plus"
      proTipTarget="_blank"
    />
  );

  if (hasPlaylists) {
    content = (
      <>
        {playlists!.map((playlist) => (
          <Card heading={playlist.name} key={playlist.id.toString()}>
            <Card.Actions>
              <Button variant="secondary" icon="play" onClick={() => setStartPlaylist(playlist)}>
                Commencer la playlist
              </Button>
              {contextSrv.isEditor && (
                <LinkButton
                  key="edit"
                  variant="secondary"
                  href={`/playlists/edit/${playlist.id}`}
                  icon="cog"
                  disabled
                  title="Fonction temporairement désactivée"
                >
                  Editer la playlist
                </LinkButton>
              )}
            </Card.Actions>
          </Card>
        ))}
      </>
    );
  }

  return (
    <Page navModel={navModel}>
      <Page.Contents isLoading={loading}>
        {hasPlaylists && (
          <OrgActionBar
            searchQuery={searchQuery}
            linkButton={{ title: 'Nouvelle playlist', href: '/playlists/new' }}
            setSearchQuery={setSearchQuery}
          />
        )}
        {content}
        {startPlaylist && <StartModal playlist={startPlaylist} onDismiss={() => setStartPlaylist(undefined)} />}
      </Page.Contents>
    </Page>
  );
};

const mapStateToProps: MapStateToProps<ConnectedProps, {}, StoreState> = (state: StoreState) => ({
  navModel: getNavModel(state.navIndex, 'playlists'),
});

export default connect(mapStateToProps)(PlaylistPage);

export interface StartModalProps {
  playlist: PlaylistDTO;
  onDismiss: () => void;
}

export const StartModal: FC<StartModalProps> = ({ playlist, onDismiss }) => {
  const [mode, setMode] = useState<any>(false);
  const [autoFit, setAutofit] = useState(false);

  const modes: Array<SelectableValue<any>> = [
    { label: 'Normal', value: false },
    { label: 'TV', value: 'tv' },
    { label: 'Kiosk', value: true },
  ];

  const onStart = () => {
    const params: any = {};
    if (mode) {
      params.kiosk = mode;
    }
    if (autoFit) {
      params.autofitpanels = true;
    }
    locationService.push(urlUtil.renderUrl(`/playlists/play/${playlist.id}`, params));
  };

  return (
    <Modal isOpen={true} icon="play" title="Start playlist" onDismiss={onDismiss}>
      <VerticalGroup>
        <Field label="Mode">
          <RadioButtonGroup value={mode} options={modes} onChange={setMode} />
        </Field>
        <Checkbox
          label="Autofit"
          description="Panel heights will be adjusted to fit screen size"
          name="autofix"
          value={autoFit}
          onChange={(e) => setAutofit(e.currentTarget.checked)}
        />
      </VerticalGroup>
      <div className="gf-form-button-row">
        <Button variant="primary" onClick={onStart}>
          Start {playlist.name}
        </Button>
      </div>
    </Modal>
  );
};
