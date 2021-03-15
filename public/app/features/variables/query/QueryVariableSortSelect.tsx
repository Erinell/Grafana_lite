import React, { PropsWithChildren, useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { VariableSelectField } from '../editor/VariableSelectField';
import { VariableSort } from '../types';

interface Props {
  onChange: (option: SelectableValue<VariableSort>) => void;
  sort: VariableSort;
}

const SORT_OPTIONS = [
  { label: 'Désactivé', value: VariableSort.disabled },
  { label: 'alphabétique (asc)', value: VariableSort.alphabeticalAsc },
  { label: 'alphabétique (desc)', value: VariableSort.alphabeticalDesc },
  { label: 'Numérique (asc)', value: VariableSort.numericalAsc },
  { label: 'Numérique (desc)', value: VariableSort.numericalDesc },
  { label: 'alphabétique (case-insensible, asc)', value: VariableSort.alphabeticalCaseInsensitiveAsc },
  { label: 'alphabétique (case-insensible, desc)', value: VariableSort.alphabeticalCaseInsensitiveDesc },
];

export function QueryVariableSortSelect({ onChange, sort }: PropsWithChildren<Props>) {
  const value = useMemo(() => SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0], [sort]);

  return (
    <VariableSelectField
      name="Trier"
      value={value}
      options={SORT_OPTIONS}
      onChange={onChange}
      labelWidth={10}
      ariaLabel={selectors.pages.Dashboard.Settings.Variables.Edit.QueryVariable.queryOptionsSortSelect}
      tooltip="Comment trier les valeurs de cette variable."
    />
  );
}
