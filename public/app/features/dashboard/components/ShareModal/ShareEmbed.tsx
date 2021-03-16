import React, { FormEvent, PureComponent } from 'react';
import { RadioButtonGroup, Switch, Field, TextArea, ClipboardButton } from '@grafana/ui';
import { SelectableValue, AppEvents } from '@grafana/data';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { appEvents } from 'app/core/core';
import { buildIframeHtml } from './utils';

const themeOptions: Array<SelectableValue<string>> = [
  { label: 'Actuel', value: 'current' },
  { label: 'Sombre', value: 'dark' },
  { label: 'Clair', value: 'light' },
];

interface Props {
  dashboard: DashboardModel;
  panel?: PanelModel;
}

interface State {
  useCurrentTimeRange: boolean;
  selectedTheme: string;
  iframeHtml: string;
}

export class ShareEmbed extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      useCurrentTimeRange: true,
      selectedTheme: 'current',
      iframeHtml: '',
    };
  }

  componentDidMount() {
    this.buildIframeHtml();
  }

  buildIframeHtml = () => {
    const { panel } = this.props;
    const { useCurrentTimeRange, selectedTheme } = this.state;

    const iframeHtml = buildIframeHtml(useCurrentTimeRange, selectedTheme, panel);
    this.setState({ iframeHtml });
  };

  onIframeHtmlChange = (event: FormEvent<HTMLTextAreaElement>) => {
    this.setState({ iframeHtml: event.currentTarget.value });
  };

  onUseCurrentTimeRangeChange = () => {
    this.setState(
      {
        useCurrentTimeRange: !this.state.useCurrentTimeRange,
      },
      this.buildIframeHtml
    );
  };

  onThemeChange = (value: string) => {
    this.setState({ selectedTheme: value }, this.buildIframeHtml);
  };

  onIframeHtmlCopy = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  getIframeHtml = () => {
    return this.state.iframeHtml;
  };

  render() {
    const { useCurrentTimeRange, selectedTheme, iframeHtml } = this.state;
    const isRelativeTime = this.props.dashboard ? this.props.dashboard.time.to === 'now' : false;

    return (
      <div className="share-modal-body">
        <div className="share-modal-header">
          <div className="share-modal-content">
            <p className="share-modal-info-text">Génerer une balise iframe avec ce panneau.</p>
            <Field
              label="Plage de temps actuelle"
              description={isRelativeTime ? 'Change la plage de temps relative en plage de temps absolue' : ''}
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
            <Field
              label="Balise html"
              description="Le code html ci-dessous peut être coller et inclus dans une autre page web. Sauf si l'accès
              anonyme est activé, les utilisateurs doivent être connecté pour que la panneau charge."
            >
              <TextArea rows={5} value={iframeHtml} onChange={this.onIframeHtmlChange}></TextArea>
            </Field>
            <ClipboardButton variant="primary" getText={this.getIframeHtml} onClipboardCopy={this.onIframeHtmlCopy}>
              Copier dans le presse-papier
            </ClipboardButton>
          </div>
        </div>
      </div>
    );
  }
}
