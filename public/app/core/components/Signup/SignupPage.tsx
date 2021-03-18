import React, { FC } from 'react';
import { Form, Field, Input, Button, HorizontalGroup, LinkButton } from '@grafana/ui';
import { getConfig } from 'app/core/config';
import { getBackendSrv } from '@grafana/runtime';
import appEvents from 'app/core/app_events';
import { AppEvents } from '@grafana/data';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { InnerBox, LoginLayout } from '../Login/LoginLayout';

interface SignupDTO {
  name?: string;
  email: string;
  username: string;
  orgName?: string;
  password: string;
  code: string;
  confirm?: string;
}

interface QueryParams {
  email?: string;
  code?: string;
}

interface Props extends GrafanaRouteComponentProps<{}, QueryParams> {}

export const SignupPage: FC<Props> = (props) => {
  const onSubmit = async (formData: SignupDTO) => {
    if (formData.name === '') {
      delete formData.name;
    }
    delete formData.confirm;

    const response = await getBackendSrv()
      .post('/api/user/signup/step2', {
        email: formData.email,
        code: formData.code,
        username: formData.email,
        orgName: formData.orgName,
        password: formData.password,
        name: formData.name,
      })
      .catch((err) => {
        const msg = err.data?.message || err;
        appEvents.emit(AppEvents.alertWarning, [msg]);
      });

    if (response.code === 'redirect-to-select-org') {
      window.location.href = getConfig().appSubUrl + '/profile/select-org?signup=1';
    }
    window.location.href = getConfig().appSubUrl + '/';
  };

  const defaultValues = {
    email: props.queryParams.email,
    code: props.queryParams.code,
  };

  return (
    <LoginLayout>
      <InnerBox>
        <Form defaultValues={defaultValues} onSubmit={onSubmit}>
          {({ errors, register, getValues }) => (
            <>
              <Field label="Votre nom">
                <Input name="name" placeholder="(facultatif)" ref={register} />
              </Field>
              <Field label="Email" invalid={!!errors.email} error={errors.email?.message}>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  ref={register({
                    required: 'Email requis',
                    pattern: {
                      value: /^\S+@\S+$/,
                      message: 'Email invalide',
                    },
                  })}
                />
              </Field>
              {!getConfig().autoAssignOrg && (
                <Field label="Org. name">
                  <Input name="orgName" placeholder="Org. name" ref={register} />
                </Field>
              )}
              {getConfig().verifyEmailEnabled && (
                <Field label="Code de vérification (envoyé par email)">
                  <Input name="code" ref={register} placeholder="Code" />
                </Field>
              )}
              <Field label="Password" invalid={!!errors.password} error={errors?.password?.message}>
                <Input
                  autoFocus
                  type="password"
                  name="password"
                  ref={register({
                    required: 'Mot de passe requis',
                  })}
                />
              </Field>
              <Field label="Confirmer le mot de passe" invalid={!!errors.confirm} error={errors?.confirm?.message}>
                <Input
                  type="password"
                  name="confirm"
                  ref={register({
                    required: 'Confirmer le mot de passe requis',
                    validate: (v) => v === getValues().password || 'Mot de passe invalide !',
                  })}
                />
              </Field>

              <HorizontalGroup>
                <Button type="submit">Envoyer</Button>
                <LinkButton variant="link" href={getConfig().appSubUrl + '/login'}>
                  Revenir à la connexion
                </LinkButton>
              </HorizontalGroup>
            </>
          )}
        </Form>
      </InnerBox>
    </LoginLayout>
  );
};

export default SignupPage;
