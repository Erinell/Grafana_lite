import React, { FC, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Field, Form, Input } from '@grafana/ui';
import { useAsync } from 'react-use';
import Page from 'app/core/components/Page/Page';
import { getConfig } from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';

interface FormModel {
  email: string;
  name?: string;
  username: string;
  password?: string;
}

const navModel = {
  main: {
    icon: 'grafana',
    text: 'Invitation',
    subTitle: 'Enregistrer votre compte Grafana',
    breadcrumbs: [{ title: 'Connexion', url: 'login' }],
  },
  node: {
    text: '',
  },
};

export interface Props extends GrafanaRouteComponentProps<{ code: string }> {}

export const SignupInvitedPage: FC<Props> = ({ match }) => {
  const code = match.params.code;
  const [initFormModel, setInitFormModel] = useState<FormModel>();
  const [greeting, setGreeting] = useState<string>();
  const [invitedBy, setInvitedBy] = useState<string>();

  useAsync(async () => {
    const invite = await getBackendSrv().get(`/api/user/invite/${code}`);

    setInitFormModel({
      email: invite.email,
      name: invite.name,
      username: invite.email,
    });

    setGreeting(invite.name || invite.email || invite.username);
    setInvitedBy(invite.invitedBy);
  }, [code]);

  const onSubmit = async (formData: FormModel) => {
    await getBackendSrv().post('/api/user/invite/complete', { ...formData, inviteCode: code });
    window.location.href = getConfig().appSubUrl + '/';
  };

  if (!initFormModel) {
    return null;
  }

  return (
    <Page navModel={navModel}>
      <Page.Contents>
        <h3 className="page-sub-heading">Bonjour {greeting || ''}.</h3>

        <div className="modal-tagline p-b-2">
          <em>{invitedBy || "Quelqu'un"}</em> vous à invité à rejoindre Grafana
          <br />
          Complétez les informations et continuez pour valider l&apos;inscription :
        </div>
        <Form defaultValues={initFormModel} onSubmit={onSubmit}>
          {({ register, errors }) => (
            <>
              <Field invalid={!!errors.email} error={errors.email && errors.email.message} label="Email">
                <Input
                  placeholder="email@example.com"
                  name="email"
                  ref={register({
                    required: 'Email requis',
                    pattern: {
                      value: /^\S+@\S+$/,
                      message: 'Email invalide',
                    },
                  })}
                />
              </Field>
              <Field invalid={!!errors.name} error={errors.name && errors.name.message} label="Nom">
                <Input placeholder="Nom (facultatif)" name="name" ref={register} />
              </Field>
              <Field
                invalid={!!errors.username}
                error={errors.username && errors.username.message}
                label="Nom d'utilisateur"
              >
                <Input placeholder="Nom d'utilisateur" name="username" ref={register({ required: 'Nom requis' })} />
              </Field>
              <Field
                invalid={!!errors.password}
                error={errors.password && errors.password.message}
                label="Mot de passe"
              >
                <Input
                  type="password"
                  placeholder="mot de passe"
                  name="password"
                  ref={register({ required: 'Mot de passe requis' })}
                />
              </Field>

              <Button type="submit">Inscription</Button>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default SignupInvitedPage;
