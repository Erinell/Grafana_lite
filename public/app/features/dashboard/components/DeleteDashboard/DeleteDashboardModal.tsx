import React from 'react';
import { css } from 'emotion';
import sumBy from 'lodash/sumBy';
import { Modal, ConfirmModal, HorizontalGroup, Button } from '@grafana/ui';
import { DashboardModel, PanelModel } from '../../state';
import { useDashboardDelete } from './useDashboardDelete';

type DeleteDashboardModalProps = {
  hideModal(): void;
  dashboard: DashboardModel;
};

export const DeleteDashboardModal: React.FC<DeleteDashboardModalProps> = ({ hideModal, dashboard }) => {
  const isProvisioned = dashboard.meta.provisioned;
  const { onRestoreDashboard } = useDashboardDelete(dashboard.uid);
  const modalBody = getModalBody(dashboard.panels, dashboard.title);

  if (isProvisioned) {
    return <ProvisionedDeleteModal hideModal={hideModal} provisionedId={dashboard.meta.provisionedExternalId!} />;
  }

  return (
    <ConfirmModal
      isOpen={true}
      body={modalBody}
      onConfirm={onRestoreDashboard}
      onDismiss={hideModal}
      title="Delete"
      icon="trash-alt"
      confirmText="Delete"
    />
  );
};

const getModalBody = (panels: PanelModel[], title: string) => {
  const totalAlerts = sumBy(panels, (panel) => (panel.alert ? 1 : 0));
  return totalAlerts > 0 ? (
    <>
      <p>Voulez vous supprimer ce tableau ?</p>
      <p>
        Ce tableau contiens {totalAlerts} alerte{totalAlerts > 1 ? 's' : ''}. Supprimer ce tableau supprimera toutes les
        alertes
      </p>
    </>
  ) : (
    <>
      <p>Voulez vous supprimer ce tableau ?</p>
      <p>{title}</p>
    </>
  );
};

const ProvisionedDeleteModal = ({ hideModal, provisionedId }: { hideModal(): void; provisionedId: string }) => (
  <Modal
    isOpen={true}
    title="Cannot delete provisioned dashboard"
    icon="trash-alt"
    onDismiss={hideModal}
    className={css`
      text-align: center;
      width: 500px;
    `}
  >
    <p>Ce tableau est gérer par Grafana et ne peut être supprimer que par la config.</p>
    <p>
      <i>
        Voir{' '}
        <a
          className="external-link"
          href="http://docs.grafana.org/administration/provisioning/#dashboards"
          target="_blank"
          rel="noreferrer"
        >
          documentation
        </a>{' '}
        pour plus d&apos;information.
      </i>
      <br />
      Chemin du fichier : {provisionedId}
    </p>
    <HorizontalGroup justify="center">
      <Button variant="secondary" onClick={hideModal}>
        OK
      </Button>
    </HorizontalGroup>
  </Modal>
);
