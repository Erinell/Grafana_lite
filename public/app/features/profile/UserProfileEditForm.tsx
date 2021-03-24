import React, { FC } from 'react';
import { Button, Tooltip, Icon, Form, Input, Field, FieldSet } from '@grafana/ui';
import { UserDTO } from 'app/types';
import config from 'app/core/config';
import { ProfileUpdateFields } from 'app/core/utils/UserProvider';

export interface Props {
  user: UserDTO;
  isSavingUser: boolean;
  updateProfile: (payload: ProfileUpdateFields) => void;
}

const { disableLoginForm } = config;

export const UserProfileEditForm: FC<Props> = ({ user, isSavingUser, updateProfile }) => {
  const onSubmitProfileUpdate = (data: ProfileUpdateFields) => {
    updateProfile(data);
  };

  return (
    <Form onSubmit={onSubmitProfileUpdate} validateOn="onBlur">
      {({ register, errors }) => {
        return (
          <FieldSet label="Edition profil">
            <Field label="Nom" invalid={!!errors.name} error="Le nom est requis" disabled={disableLoginForm}>
              <Input
                name="name"
                ref={register({ required: true })}
                placeholder="Nom"
                defaultValue={user.name}
                suffix={<InputSuffix />}
              />
            </Field>
            <Field
              label="Email"
              invalid={!!errors.email}
              error="L'adresse Email est requise"
              disabled={disableLoginForm}
            >
              <Input
                name="email"
                ref={register({ required: true })}
                placeholder="Email"
                defaultValue={user.email}
                suffix={<InputSuffix />}
              />
            </Field>
            <Field label="Nom d'utilisateur" disabled={disableLoginForm}>
              <Input
                name="login"
                ref={register}
                defaultValue={user.login}
                placeholder="Nom d'utilisateur"
                suffix={<InputSuffix />}
              />
            </Field>
            <div className="gf-form-button-row">
              <Button variant="primary" disabled={isSavingUser}>
                Sauvegarder
              </Button>
            </div>
          </FieldSet>
        );
      }}
    </Form>
  );
};

export default UserProfileEditForm;

const InputSuffix: FC = () => {
  return disableLoginForm ? (
    <Tooltip content="Détails de connexion verrouillés.">
      <Icon name="lock" />
    </Tooltip>
  ) : null;
};
