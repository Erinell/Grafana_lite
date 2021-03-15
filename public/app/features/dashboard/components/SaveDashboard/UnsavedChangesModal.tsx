import React from 'react';
import { Button, HorizontalGroup, Modal, VerticalGroup } from '@grafana/ui';
import { SaveDashboardButton } from './SaveDashboardButton';
import { DashboardModel } from '../../state';
import { css } from 'emotion';

interface UnsavedChangesModalProps {
  dashboard: DashboardModel;
  onDiscard: () => void;
  onDismiss: () => void;
  onSaveSuccess?: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  dashboard,
  onSaveSuccess,
  onDiscard,
  onDismiss,
}) => {
  return (
    <Modal
      isOpen={true}
      title="Unsaved changes"
      onDismiss={onDismiss}
      icon="exclamation-triangle"
      className={css`
        width: 500px;
      `}
    >
      <VerticalGroup align={'center'} spacing={'md'}>
        <h4>Voulez-vous sauvegarder les changements ?</h4>
        <HorizontalGroup justify="center">
          <SaveDashboardButton dashboard={dashboard} onSaveSuccess={onSaveSuccess} />
          <Button
            variant="destructive"
            onClick={() => {
              onDiscard();
              onDismiss();
            }}
          >
            Rejeter
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            Annuler
          </Button>
        </HorizontalGroup>
      </VerticalGroup>
    </Modal>
  );
};
