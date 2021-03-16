import { DataFrame, DataQuery, DataQueryError } from '@grafana/data';

export const SHARED_DASHBODARD_QUERY = '-- Tableau --';

export interface DashboardQuery extends DataQuery {
  panelId?: number;
}

export type ResultInfo = {
  img: string; // The Datasource
  refId: string;
  query: string; // As text
  data: DataFrame[];
  error?: DataQueryError;
};
