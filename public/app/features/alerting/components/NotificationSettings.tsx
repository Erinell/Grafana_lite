import React, { FC } from 'react';
import { Checkbox, CollapsableSection, Field, InfoBox, Input } from '@grafana/ui';
import { NotificationSettingsProps } from './NotificationChannelForm';

interface Props extends NotificationSettingsProps {
  imageRendererAvailable: boolean;
}

export const NotificationSettings: FC<Props> = ({ currentFormValues, imageRendererAvailable, register }) => {
  return (
    <CollapsableSection label="Options de notification" isOpen={false}>
      <Field>
        <Checkbox
          name="isDefault"
          ref={register}
          label="Défaut"
          description="Utiliser cette notification pour toutes les alertes"
        />
      </Field>
      <Field>
        <Checkbox
          name="settings.uploadImage"
          ref={register}
          label="Inclure image"
          description="Créer une capture et l'inclue dans la notification"
        />
      </Field>
      {currentFormValues.uploadImage && !imageRendererAvailable && (
        <InfoBox title="No image renderer available/installed">
          Grafana cannot find an image renderer to capture an image for the notification. Please make sure the Grafana
          Image Renderer plugin is installed. Please contact your Grafana administrator to install the plugin.
        </InfoBox>
      )}
      <Field>
        <Checkbox
          name="disableResolveMessage"
          ref={register}
          label="Désactiver message de résolution"
          description="Désactiver le message de résolution [OK] qui est envoyé quand l'alerte renvoie false"
        />
      </Field>
      <Field>
        <Checkbox
          name="sendReminder"
          ref={register}
          label="Envoyer rappels"
          description="Envoyer des notifications supplémentaires pour les alertes déclenchées"
        />
      </Field>
      {currentFormValues.sendReminder && (
        <>
          <Field
            label="Send reminder every"
            description="Spécifier la fréquence d'envoi, e.g. chaque 30s, 1m, 10m, 30m or 1h etc.
            Les rappels sont envoyés après évaluation de la règle."
          >
            <Input name="frequency" ref={register} width={8} />
          </Field>
        </>
      )}
    </CollapsableSection>
  );
};
