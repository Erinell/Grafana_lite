import { DataQuery, DataTransformerConfig } from '@grafana/data';
import { DataSourceSrv } from '@grafana/runtime';

export const getDefaultCondition = () => ({
  type: 'query',
  query: { params: ['A', '5m', 'now'] },
  reducer: { type: 'Moy', params: [] as any[] },
  evaluator: { type: 'gt', params: [null] as any[] },
  operator: { type: 'et' },
});

export const getAlertingValidationMessage = async (
  transformations: DataTransformerConfig[] | undefined,
  targets: DataQuery[],
  datasourceSrv: DataSourceSrv,
  datasourceName: string | null
): Promise<string> => {
  if (targets.length === 0) {
    return 'Aucune requête métrique trouvée';
  }

  if (transformations && transformations.length) {
    return "Transformations non supportées en requêtes d'alerte";
  }

  let alertingNotSupported = 0;
  let templateVariablesNotSupported = 0;

  for (const target of targets) {
    const dsName = target.datasource || datasourceName;
    const ds = await datasourceSrv.get(dsName);
    if (!ds.meta.alerting) {
      alertingNotSupported++;
    } else if (ds.targetContainsTemplate && ds.targetContainsTemplate(target)) {
      templateVariablesNotSupported++;
    }
  }

  if (alertingNotSupported === targets.length) {
    return "La source de données ne supporte pas les requêtes d'alerte";
  }

  if (templateVariablesNotSupported === targets.length) {
    return 'Template variables are not supported in alert queries';
  }

  return '';
};
