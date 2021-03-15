import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { InlineField, Select, FeatureInfoBox } from '@grafana/ui';
import { QueryEditorProps, SelectableValue, LiveChannelScope, FeatureState } from '@grafana/data';
import { getLiveMeasurements, LiveMeasurements } from '@grafana/runtime';
import { GrafanaDatasource } from '../datasource';
import { defaultQuery, GrafanaQuery, GrafanaQueryType } from '../types';

type Props = QueryEditorProps<GrafanaDatasource, GrafanaQuery>;

const labelWidth = 12;

export class QueryEditor extends PureComponent<Props> {
  queryTypes: Array<SelectableValue<GrafanaQueryType>> = [
    {
      label: 'Avance aléatoire',
      value: GrafanaQueryType.RandomWalk,
      description: 'Valeur aléatoire dans la plage de temps',
    },
    {
      label: 'Mesures en direct',
      value: GrafanaQueryType.LiveMeasurements,
      description: 'Diffuse en direct les mesures de Grafana',
    },
  ];

  onQueryTypeChange = (sel: SelectableValue<GrafanaQueryType>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, queryType: sel.value! });
    onRunQuery();
  };

  onChannelChange = (sel: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, channel: sel?.value });
    onRunQuery();
  };

  onMeasurementNameChanged = (sel: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      measurements: {
        ...query.measurements,
        name: sel?.value,
      },
    });
    onRunQuery();
  };

  renderMeasurementsQuery() {
    let { channel, measurements } = this.props.query;
    const channels: Array<SelectableValue<string>> = [];
    let currentChannel = channels.find((c) => c.value === channel);
    if (channel && !currentChannel) {
      currentChannel = {
        value: channel,
        label: channel,
        description: `Connecté à ${channel}`,
      };
      channels.push(currentChannel);
    }

    if (!measurements) {
      measurements = {};
    }
    const names: Array<SelectableValue<string>> = [
      { value: '', label: 'All measurements', description: 'Voir chaques mesures streamé à ce canal' },
    ];

    let info: LiveMeasurements | undefined = undefined;
    if (channel) {
      info = getLiveMeasurements({
        scope: LiveChannelScope.Grafana,
        namespace: 'measurements',
        path: channel,
      });

      let foundName = false;
      if (info) {
        for (const name of info.getDistinctNames()) {
          names.push({
            value: name,
            label: name,
          });
          if (name === measurements.name) {
            foundName = true;
          }
        }
      } else {
        console.log('NO INFO for', channel);
      }

      if (measurements.name && !foundName) {
        names.push({
          label: measurements.name,
          value: measurements.name,
          description: `Cadres avec nom ${measurements.name}`,
        });
      }
    }

    return (
      <>
        <div className="gf-form">
          <InlineField label="Canal" grow={true} labelWidth={labelWidth}>
            <Select
              options={channels}
              value={currentChannel || ''}
              onChange={this.onChannelChange}
              allowCustomValue={true}
              backspaceRemovesValue={true}
              placeholder="Sélectionner le canal de mesure"
              isClearable={true}
              noOptionsMessage="Entrer un nom de canal"
              formatCreateLabel={(input: string) => `Connecté à : ${input}`}
            />
          </InlineField>
        </div>
        {channel && (
          <div className="gf-form">
            <InlineField label="Measurement" grow={true} labelWidth={labelWidth}>
              <Select
                options={names}
                value={names.find((v) => v.value === measurements?.name) || names[0]}
                onChange={this.onMeasurementNameChanged}
                allowCustomValue={true}
                backspaceRemovesValue={true}
                placeholder="Filtrer par nom"
                isClearable={true}
                noOptionsMessage="Filtrer par nom"
                formatCreateLabel={(input: string) => `Voir : ${input}`}
                isSearchable={true}
              />
            </InlineField>
          </div>
        )}

        <FeatureInfoBox title="Grafana Live - Mesures" featureState={FeatureState.alpha}>
          <p>
            Cela prend en charge les strems en temps réel dans le noyau Grafana. Cette fonctionnalité est en cours de
            développement intensif. Attendez-vous à ce que les interfaces et les structures changent à mesure du
            développement.
          </p>
        </FeatureInfoBox>
      </>
    );
  }

  render() {
    const query = defaults(this.props.query, defaultQuery);
    return (
      <>
        <div className="gf-form">
          <InlineField label="Type requête" grow={true} labelWidth={labelWidth}>
            <Select
              options={this.queryTypes}
              value={this.queryTypes.find((v) => v.value === query.queryType) || this.queryTypes[0]}
              onChange={this.onQueryTypeChange}
            />
          </InlineField>
        </div>
        {query.queryType === GrafanaQueryType.LiveMeasurements && this.renderMeasurementsQuery()}
      </>
    );
  }
}
