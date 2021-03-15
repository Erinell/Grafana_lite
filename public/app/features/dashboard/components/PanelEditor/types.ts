import { DataFrame, FieldConfigSource, PanelPlugin } from '@grafana/data';

export interface PanelEditorTab {
  id: string;
  text: string;
  active: boolean;
  icon: string;
}

export enum PanelEditorTabId {
  Query = 'query',
  Transform = 'transform',
  Visualize = 'visualize',
  Alert = 'alert',
}

export enum DisplayMode {
  Fill = 0,
  Fit = 1,
  Exact = 2,
}

export const displayModes = [
  { value: DisplayMode.Fill, label: 'Remplir', description: 'Utilise toute la place disponible' },
  { value: DisplayMode.Fit, label: 'Ajuster', description: 'Ajuster dans la place en gardant le ratio' },
  { value: DisplayMode.Exact, label: 'Exacte', description: 'Même taille que le tableau' },
];

/** @internal */
export interface Props {
  plugin: PanelPlugin;
  config: FieldConfigSource;
  onChange: (config: FieldConfigSource) => void;
  /* Helpful for IntelliSense */
  data: DataFrame[];
}
