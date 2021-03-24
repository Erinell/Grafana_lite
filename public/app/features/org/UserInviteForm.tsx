import React, { FC } from 'react';
import { HorizontalGroup, Button, LinkButton, Input, RadioButtonGroup, Form, Field, InputControl } from '@grafana/ui';
import { getConfig } from 'app/core/config';
import { OrgRole } from 'app/types';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { appEvents } from 'app/core/core';
import { AppEvents, locationUtil } from '@grafana/data';

const roles = [
  { label: 'Membre', value: OrgRole.Viewer },
  { label: 'Editeur', value: OrgRole.Editor },
  { label: 'Admin', value: OrgRole.Admin },
];

interface FormModel {
  role: OrgRole;
  name: string;
  loginOrEmail?: string;
  sendEmail: boolean;
  email: string;
}

interface Props {}

export const UserInviteForm: FC<Props> = ({}) => {
  const onSubmit = async (formData: FormModel) => {
    try {
      await getBackendSrv().post('/api/org/invites', formData);
    } catch (err) {
      appEvents.emit(AppEvents.alertError, ["Erreur lors de l'invitation", err.message]);
    }
    locationService.push('/org/users/');
  };

  const defaultValues: FormModel = {
    name: '',
    email: '',
    role: OrgRole.Editor,
    sendEmail: false,
  };

  return (
    <Form defaultValues={defaultValues} onSubmit={onSubmit}>
      {({ register, control, errors }) => {
        return (
          <>
            <Field
              invalid={!!errors.loginOrEmail}
              error={!!errors.loginOrEmail ? 'Email invalide' : undefined}
              label="Email"
            >
              <Input
                name="loginOrEmail"
                placeholder="email@example.com"
                ref={register({
                  required: true,
                  pattern: {
                    value: /^\S+@\S+$/,
                    message: 'Email invalide',
                  },
                })}
              />
            </Field>
            <Field invalid={!!errors.name} label="Nom">
              <Input name="name" placeholder="(facultatif)" ref={register} />
            </Field>
            <Field invalid={!!errors.role} label="Rôle">
              <InputControl as={RadioButtonGroup} control={control} options={roles} name="role" />
            </Field>
            <HorizontalGroup>
              <Button type="submit">Envoyer</Button>
              <LinkButton href={locationUtil.assureBaseUrl(getConfig().appSubUrl + '/org/users')} variant="secondary">
                Retour
              </LinkButton>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

export default UserInviteForm;
