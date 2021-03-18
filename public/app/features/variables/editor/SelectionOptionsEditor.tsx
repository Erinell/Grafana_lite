import React, { ChangeEvent, FormEvent, FunctionComponent, useCallback } from 'react';
import { InlineFieldRow, VerticalGroup } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';

import { VariableWithMultiSupport } from '../types';
import { VariableEditorProps } from './types';
import { toVariableIdentifier, VariableIdentifier } from '../state/types';
import { VariableSectionHeader } from './VariableSectionHeader';
import { VariableSwitchField } from './VariableSwitchField';
import { VariableTextField } from './VariableTextField';

export interface SelectionOptionsEditorProps<Model extends VariableWithMultiSupport = VariableWithMultiSupport>
  extends VariableEditorProps<Model> {
  onMultiChanged: (identifier: VariableIdentifier, value: boolean) => void;
}

export const SelectionOptionsEditor: FunctionComponent<SelectionOptionsEditorProps> = (props) => {
  const onMultiChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      props.onMultiChanged(toVariableIdentifier(props.variable), event.target.checked);
    },
    [props.onMultiChanged, props.variable]
  );

  const onIncludeAllChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      props.onPropChange({ propName: 'includeAll', propValue: event.target.checked });
    },
    [props.onPropChange]
  );

  const onAllValueChanged = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      props.onPropChange({ propName: 'allValue', propValue: event.currentTarget.value });
    },
    [props.onPropChange]
  );
  return (
    <VerticalGroup spacing="none">
      <VariableSectionHeader name="Options de sélection" />
      <InlineFieldRow>
        <VariableSwitchField
          value={props.variable.multi}
          name="Multi-valeur"
          tooltip="Permet de sélectionner plusieurs valeurs en même temps"
          onChange={onMultiChanged}
          ariaLabel={selectors.pages.Dashboard.Settings.Variables.Edit.General.selectionOptionsMultiSwitch}
        />
      </InlineFieldRow>
      <InlineFieldRow>
        <VariableSwitchField
          value={props.variable.includeAll}
          name="Option inclure tout"
          tooltip="Active l'option pour inclure toutes les variables"
          onChange={onIncludeAllChanged}
          ariaLabel={selectors.pages.Dashboard.Settings.Variables.Edit.General.selectionOptionsIncludeAllSwitch}
        />
      </InlineFieldRow>
      {props.variable.includeAll && (
        <InlineFieldRow>
          <VariableTextField
            value={props.variable.allValue ?? ''}
            onChange={onAllValueChanged}
            name="Valeur personnalisée"
            placeholder="blank = auto"
            ariaLabel={selectors.pages.Dashboard.Settings.Variables.Edit.General.selectionOptionsCustomAllInput}
            labelWidth={20}
          />
        </InlineFieldRow>
      )}
    </VerticalGroup>
  );
};
SelectionOptionsEditor.displayName = 'SelectionOptionsEditor';
