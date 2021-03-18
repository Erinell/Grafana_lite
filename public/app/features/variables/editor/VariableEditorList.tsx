import React, { FC, MouseEvent, PureComponent } from 'react';
import { css } from 'emotion';
import { Icon, IconButton, useStyles } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import { GrafanaTheme } from '@grafana/data';

import EmptyListCTA from '../../../core/components/EmptyListCTA/EmptyListCTA';
import { QueryVariableModel, VariableModel } from '../types';
import { toVariableIdentifier, VariableIdentifier } from '../state/types';
import { DashboardModel } from '../../dashboard/state';
import { getVariableUsages, UsagesToNetwork, VariableUsageTree } from '../inspect/utils';
import { isAdHoc } from '../guard';
import { VariableUsagesButton } from '../inspect/VariableUsagesButton';

export interface Props {
  variables: VariableModel[];
  dashboard: DashboardModel | null;
  usages: VariableUsageTree[];
  usagesNetwork: UsagesToNetwork[];
  onAddClick: (event: MouseEvent) => void;
  onEditClick: (identifier: VariableIdentifier) => void;
  onChangeVariableOrder: (identifier: VariableIdentifier, fromIndex: number, toIndex: number) => void;
  onDuplicateVariable: (identifier: VariableIdentifier) => void;
  onRemoveVariable: (identifier: VariableIdentifier) => void;
}

enum MoveType {
  down = 1,
  up = -1,
}

export class VariableEditorList extends PureComponent<Props> {
  onEditClick = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onEditClick(identifier);
  };

  onChangeVariableOrder = (event: MouseEvent, variable: VariableModel, moveType: MoveType) => {
    event.preventDefault();
    this.props.onChangeVariableOrder(toVariableIdentifier(variable), variable.index, variable.index + moveType);
  };

  onDuplicateVariable = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onDuplicateVariable(identifier);
  };

  onRemoveVariable = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onRemoveVariable(identifier);
  };

  render() {
    return (
      <div>
        <div>
          {this.props.variables.length === 0 && (
            <div>
              <EmptyListCTA
                title="Pas de variables pour le moment"
                buttonIcon="calculator-alt"
                buttonTitle="Ajouter"
                infoBox={{
                  __html: ` <p>
                    Les variables permettent des tableaux plus intéractifs et dynamiques. Au lieu de coder en dur des
                    éléments tels que les noms de serveurs ou de capteurs dans vos requêtes, vous pouvez utiliser des
                    variables à leur place. Les variables sont affichées sous forme de zones de sélection déroulantes en 
                    haut du tableau. Ces listes déroulantes facilitent la modification des données affichées dans votre 
                    tableau. Consultez
                    <a class="external-link" href="http://docs.grafana.org/reference/templating/" target="_blank">
                      la documentation
                    </a>
                    pour plus d'informations
                  </p>`,
                }}
                infoBoxTitle="Que font les variables ?"
                onClick={this.props.onAddClick}
              />
            </div>
          )}

          {this.props.variables.length > 0 && (
            <div>
              <table
                className="filter-table filter-table--hover"
                aria-label={selectors.pages.Dashboard.Settings.Variables.List.table}
              >
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Definition</th>
                    <th colSpan={6} />
                  </tr>
                </thead>
                <tbody>
                  {this.props.variables.map((state, index) => {
                    const variable = state as QueryVariableModel;
                    const definition = variable.definition
                      ? variable.definition
                      : typeof variable.query === 'string'
                      ? variable.query
                      : '';
                    const usages = getVariableUsages(variable.id, this.props.usages);
                    const passed = usages > 0 || isAdHoc(variable);
                    return (
                      <tr key={`${variable.name}-${index}`}>
                        <td style={{ width: '1%' }}>
                          <span
                            onClick={(event) => this.onEditClick(event, toVariableIdentifier(variable))}
                            className="pointer template-variable"
                            aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowNameFields(
                              variable.name
                            )}
                          >
                            {variable.name}
                          </span>
                        </td>
                        <td
                          style={{ maxWidth: '200px' }}
                          onClick={(event) => this.onEditClick(event, toVariableIdentifier(variable))}
                          className="pointer max-width"
                          aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowDefinitionFields(
                            variable.name
                          )}
                        >
                          {definition}
                        </td>

                        <td style={{ width: '1%' }}>
                          <VariableCheckIndicator passed={passed} />
                        </td>

                        <td style={{ width: '1%' }}>
                          <VariableUsagesButton
                            id={variable.id}
                            isAdhoc={isAdHoc(variable)}
                            usages={this.props.usagesNetwork}
                          />
                        </td>

                        <td style={{ width: '1%' }}>
                          {index > 0 && (
                            <IconButton
                              onClick={(event) => this.onChangeVariableOrder(event, variable, MoveType.up)}
                              name="arrow-up"
                              title="Move variable up"
                              aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowArrowUpButtons(
                                variable.name
                              )}
                            />
                          )}
                        </td>

                        <td style={{ width: '1%' }}>
                          {index < this.props.variables.length - 1 && (
                            <IconButton
                              onClick={(event) => this.onChangeVariableOrder(event, variable, MoveType.down)}
                              name="arrow-down"
                              title="Move variable down"
                              aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowArrowDownButtons(
                                variable.name
                              )}
                            />
                          )}
                        </td>

                        <td style={{ width: '1%' }}>
                          <IconButton
                            onClick={(event) => this.onDuplicateVariable(event, toVariableIdentifier(variable))}
                            name="copy"
                            title="Duplicate variable"
                            aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowDuplicateButtons(
                              variable.name
                            )}
                          />
                        </td>

                        <td style={{ width: '1%' }}>
                          <IconButton
                            onClick={(event) => this.onRemoveVariable(event, toVariableIdentifier(variable))}
                            name="trash-alt"
                            title="Remove variable"
                            aria-label={selectors.pages.Dashboard.Settings.Variables.List.tableRowRemoveButtons(
                              variable.name
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

interface VariableCheckIndicatorProps {
  passed: boolean;
}

const VariableCheckIndicator: FC<VariableCheckIndicatorProps> = ({ passed }) => {
  const style = useStyles(getStyles);
  if (passed) {
    return (
      <Icon
        name="check"
        className={style.iconPassed}
        title="This variable is referenced by other variables or dashboard"
      />
    );
  }

  return (
    <Icon
      name="exclamation-triangle"
      className={style.iconFailed}
      title="This variable is not referenced by any variable or dashboard"
    />
  );
};

const getStyles = (theme: GrafanaTheme) => ({
  iconPassed: css`
    color: ${theme.palette.greenBase};
  `,
  iconFailed: css`
    color: ${theme.palette.orange};
  `,
});
