import React, { FC, useState } from 'react';
import { Form, Field, Input, Button, Legend, Container, HorizontalGroup, LinkButton } from '@grafana/ui';
import { getConfig } from 'app/core/config';
import { getBackendSrv } from '@grafana/runtime';
import appEvents from 'app/core/app_events';
import { AppEvents } from '@grafana/data';

interface EmailDTO {
  email: string;
}

export const VerifyEmail: FC = () => {
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = (formModel: EmailDTO) => {
    getBackendSrv()
      .post('/api/user/signup', formModel)
      .then(() => {
        setEmailSent(true);
      })
      .catch((err) => {
        const msg = err.data?.message || err;
        appEvents.emit(AppEvents.alertWarning, [msg]);
      });
  };

  if (emailSent) {
    return (
      <div>
        <p>Un mail avec un lien de vérification à été envoyé. Vous aller le recevoir rapidement.</p>
        <Container margin="md" />
        <LinkButton variant="primary" href={getConfig().appSubUrl + '/signup'}>
          Completer l&apos;inscription
        </LinkButton>
      </div>
    );
  }

  return (
    <Form onSubmit={onSubmit}>
      {({ register, errors }) => (
        <>
          <Legend>Vérifier Email</Legend>
          <Field
            label="Email"
            description="Enter your email address to get a verification link sent to you"
            invalid={!!(errors as any).email}
            error={(errors as any).email?.message}
          >
            <Input placeholder="Email" name="email" ref={register({ required: true })} />
          </Field>
          <HorizontalGroup>
            <Button>Envoyer email de verification</Button>
            <LinkButton variant="link" href={getConfig().appSubUrl + '/login'}>
              Revenir à la connexion
            </LinkButton>
          </HorizontalGroup>
        </>
      )}
    </Form>
  );
};
