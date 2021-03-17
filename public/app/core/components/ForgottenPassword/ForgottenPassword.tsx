import React, { FC, useState } from 'react';
import { Form, Field, Input, Button, Legend, Container, useStyles, HorizontalGroup, LinkButton } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { css } from 'emotion';
import { GrafanaTheme } from '@grafana/data';
import config from 'app/core/config';

interface EmailDTO {
  userOrEmail: string;
}

const paragraphStyles = (theme: GrafanaTheme) => css`
  color: ${theme.colors.formDescription};
  font-size: ${theme.typography.size.sm};
  font-weight: ${theme.typography.weight.regular};
  margin-top: ${theme.spacing.sm};
  display: block;
`;

export const ForgottenPassword: FC = () => {
  const [emailSent, setEmailSent] = useState(false);
  const styles = useStyles(paragraphStyles);
  const loginHref = `${config.appSubUrl}/login`;

  const sendEmail = async (formModel: EmailDTO) => {
    const res = await getBackendSrv().post('/api/user/password/send-reset-email', formModel);
    if (res) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div>
        <p>Un email avec un lien de réinitialisation vous a été envoyé. Vous aller le recevoir rapidement</p>
        <Container margin="md" />
        <LinkButton variant="primary" href={loginHref}>
          Back to login
        </LinkButton>
      </div>
    );
  }
  return (
    <Form onSubmit={sendEmail}>
      {({ register, errors }) => (
        <>
          <Legend>Réinitialiser mot de passe</Legend>
          <Field
            label="Utilisateur"
            description="Entrez vos informations pour recevoir un lien de réinitialisation"
            invalid={!!errors.userOrEmail}
            error={errors?.userOrEmail?.message}
          >
            <Input placeholder="Email ou nom" name="userOrEmail" ref={register({ required: true })} />
          </Field>
          <HorizontalGroup>
            <Button>Emvoyer un lien</Button>
            <LinkButton variant="link" href={loginHref}>
              Revenir à la connexion
            </LinkButton>
          </HorizontalGroup>

          <p className={styles}>Vous avez oublier votre email ou nom ? Contactez votre administrateur Grafana.</p>
        </>
      )}
    </Form>
  );
};
