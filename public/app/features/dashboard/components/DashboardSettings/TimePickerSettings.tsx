import React, { PureComponent } from 'react';
import { Input, TimeZonePicker, Field, Switch, CollapsableSection } from '@grafana/ui';
import { rangeUtil, TimeZone } from '@grafana/data';
import isEmpty from 'lodash/isEmpty';
import { selectors } from '@grafana/e2e-selectors';
import { AutoRefreshIntervals } from './AutoRefreshIntervals';

interface Props {
  onTimeZoneChange: (timeZone: TimeZone) => void;
  onRefreshIntervalChange: (interval: string[]) => void;
  onNowDelayChange: (nowDelay: string) => void;
  onHideTimePickerChange: (hide: boolean) => void;
  refreshIntervals: string[];
  timePickerHidden: boolean;
  nowDelay: string;
  timezone: TimeZone;
}

interface State {
  isNowDelayValid: boolean;
}

export class TimePickerSettings extends PureComponent<Props, State> {
  state: State = { isNowDelayValid: true };

  onNowDelayChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    if (isEmpty(value)) {
      this.setState({ isNowDelayValid: true });
      return this.props.onNowDelayChange(value);
    }

    if (rangeUtil.isValidTimeSpan(value)) {
      this.setState({ isNowDelayValid: true });
      return this.props.onNowDelayChange(value);
    }

    this.setState({ isNowDelayValid: false });
  };

  onHideTimePickerChange = () => {
    this.props.onHideTimePickerChange(!this.props.timePickerHidden);
  };

  onTimeZoneChange = (timeZone: string) => {
    if (typeof timeZone !== 'string') {
      return;
    }
    this.props.onTimeZoneChange(timeZone);
  };

  render() {
    return (
      <CollapsableSection label="Options de temps" isOpen={true}>
        <Field label="Timezone" aria-label={selectors.components.TimeZonePicker.container}>
          <TimeZonePicker
            includeInternal={true}
            value={this.props.timezone}
            onChange={this.onTimeZoneChange}
            width={40}
          />
        </Field>
        <AutoRefreshIntervals
          refreshIntervals={this.props.refreshIntervals}
          onRefreshIntervalChange={this.props.onRefreshIntervalChange}
        />
        <Field
          label="Actuel d??lai actuel"
          description="Entrer 1m pour ignorer la derni??re minute (car peux contenir des m??triques incomplets)"
        >
          <Input
            invalid={!this.state.isNowDelayValid}
            placeholder="0m"
            onChange={this.onNowDelayChange}
            defaultValue={this.props.nowDelay}
          />
        </Field>
        <Field label="Cacher le s??l??cteur de temps">
          <Switch value={!!this.props.timePickerHidden} onChange={this.onHideTimePickerChange} />
        </Field>
      </CollapsableSection>
    );
  }
}
