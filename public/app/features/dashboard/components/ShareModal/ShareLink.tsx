import React, { PureComponent } from 'react';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { Field, RadioButtonGroup, Switch, ClipboardButton, Icon, InfoBox, Input, FieldSet } from '@grafana/ui';
import { SelectableValue, PanelModel, AppEvents } from '@grafana/data';
import { DashboardModel } from 'app/features/dashboard/state';
import { buildImageUrl, buildShareUrl } from './utils';
import { appEvents } from 'app/core/core';
import config from 'app/core/config';

const themeOptions: Array<SelectableValue<string>> = [
  { label: 'Actuel', value: 'current' },
  { label: 'Sombre', value: 'dark' },
  { label: 'Clair', value: 'light' },
];

export interface Props {
  dashboard: DashboardModel;
  panel?: PanelModel;
}

export interface State {
  useCurrentTimeRange: boolean;
  useShortUrl: boolean;
  selectedTheme: string;
  shareUrl: string;
  imageUrl: string;
}

export class ShareLink extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      useCurrentTimeRange: true,
      useShortUrl: false,
      selectedTheme: 'current',
      shareUrl: '',
      imageUrl: '',
    };
  }

  componentDidMount() {
    this.buildUrl();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { useCurrentTimeRange, useShortUrl, selectedTheme } = this.state;
    if (
      prevState.useCurrentTimeRange !== useCurrentTimeRange ||
      prevState.selectedTheme !== selectedTheme ||
      prevState.useShortUrl !== useShortUrl
    ) {
      this.buildUrl();
    }
  }

  buildUrl = async () => {
    const { panel } = this.props;
    const { useCurrentTimeRange, useShortUrl, selectedTheme } = this.state;

    const shareUrl = await buildShareUrl(useCurrentTimeRange, selectedTheme, panel, useShortUrl);
    const imageUrl = buildImageUrl(useCurrentTimeRange, selectedTheme, panel);

    this.setState({ shareUrl, imageUrl });
  };

  onUseCurrentTimeRangeChange = () => {
    this.setState({ useCurrentTimeRange: !this.state.useCurrentTimeRange });
  };

  onUrlShorten = () => {
    this.setState({ useShortUrl: !this.state.useShortUrl });
  };

  onThemeChange = (value: string) => {
    this.setState({ selectedTheme: value });
  };

  onShareUrlCopy = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Contenu copié']);
  };

  getShareUrl = () => {
    return this.state.shareUrl;
  };

  render() {
    const { panel } = this.props;
    const isRelativeTime = this.props.dashboard ? this.props.dashboard.time.to === 'now' : false;
    const { useCurrentTimeRange, useShortUrl, selectedTheme, shareUrl, imageUrl } = this.state;
    const selectors = e2eSelectors.pages.SharePanelModal;

    return (
      <div className="share-modal-body">
        <div className="share-modal-header">
          <div className="share-modal-content">
            <p className="share-modal-info-text">
              Créer un lien direct à ce tableau ou panneau, modifié avec les options ci-dessous.
            </p>
            <FieldSet>
              <Field
                label="Plage de temps actuelle"
                description={isRelativeTime ? 'Changer la plage de temps relative en plage de temps absolue' : ''}
              >
                <Switch
                  id="share-current-time-range"
                  value={useCurrentTimeRange}
                  onChange={this.onUseCurrentTimeRangeChange}
                />
              </Field>
              <Field label="Thème">
                <RadioButtonGroup options={themeOptions} value={selectedTheme} onChange={this.onThemeChange} />
              </Field>
              <Field label="URL court">
                <Switch id="share-shorten-url" value={useShortUrl} onChange={this.onUrlShorten} />
              </Field>

              <Field label="Lien URL">
                <Input
                  value={shareUrl}
                  readOnly
                  addonAfter={
                    <ClipboardButton variant="primary" getText={this.getShareUrl} onClipboardCopy={this.onShareUrlCopy}>
                      <Icon name="copy" /> Copier
                    </ClipboardButton>
                  }
                />
              </Field>
            </FieldSet>
            {panel && config.rendererAvailable && (
              <div className="gf-form">
                <a href={imageUrl} target="_blank" rel="noreferrer" aria-label={selectors.linkToRenderedImage}>
                  <Icon name="camera" /> Lien direct du rendu image
                </a>
              </div>
            )}
            {panel && !config.rendererAvailable && (
              <InfoBox>
                <p>
                  <>Pour le rendu image, vous devez installer le </>
                  <a
                    href="https://grafana.com/grafana/plugins/grafana-image-renderer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    plugin de rendu
                  </a>
                  . Veuillez contacter votre adminstrateur Grafana pour installer ce plugin.
                </p>
              </InfoBox>
            )}
          </div>
        </div>
      </div>
    );
  }
}
