import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, VerticalGroup } from '@grafana/ui';

import { Layout } from '@grafana/ui/src/components/Layout/Layout';
import { PanelEditorTabId } from './types';
import { locationService } from '@grafana/runtime';

export interface Props {
  message: string;
  dispatch?: Dispatch;
}

export const PanelNotSupported: FC<Props> = ({ message, dispatch: propsDispatch }) => {
  const dispatch = propsDispatch ? propsDispatch : useDispatch();
  const onBackToQueries = useCallback(() => {
    locationService.partial({ tab: PanelEditorTabId.Query });
  }, [dispatch]);

  return (
    <Layout justify="center" style={{ marginTop: '100px' }}>
      <VerticalGroup spacing="md">
        <h2>{message}</h2>
        <div>
          <Button size="md" variant="secondary" icon="arrow-left" onClick={onBackToQueries}>
            Revenir aux requêtes
          </Button>
        </div>
      </VerticalGroup>
    </Layout>
  );
};
