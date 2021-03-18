import React, { FC } from 'react';
import config from 'app/core/config';
import { UserDTO } from 'app/types';
import { Button, LinkButton, Form, Field, Input, HorizontalGroup } from '@grafana/ui';
import { ChangePasswordFields } from 'app/core/utils/UserProvider';
import { css } from 'emotion';

export interface Props {
  user: UserDTO;
  isSaving: boolean;
  onChangePassword: (payload: ChangePasswordFields) => void;
}

export const ChangePasswordForm: FC<Props> = ({ user, onChangePassword, isSaving }) => {
  const { ldapEnabled, authProxyEnabled, disableLoginForm } = config;
  const authSource = user.authLabels?.length && user.authLabels[0];

  if (ldapEnabled || authProxyEnabled) {
    return (
      <p>Vous ne pouvez pas changer de mot de passe quand l&apos;authentification ldap ou auth proxy est activé.</p>
    );
  }
  if (authSource && disableLoginForm) {
    return <p>Le mot de passe ne peux pas être changé ici !</p>;
  }

  return (
    <div
      className={css`
        max-width: 400px;
      `}
    >
      <Form onSubmit={onChangePassword}>
        {({ register, errors, getValues }) => {
          return (
            <>
              <Field label="Ancien mot de passe" invalid={!!errors.oldPassword} error={errors?.oldPassword?.message}>
                <Input type="password" name="oldPassword" ref={register({ required: 'Ancien mot de passe requis' })} />
              </Field>

              <Field label="Nouveau mot de passe" invalid={!!errors.newPassword} error={errors?.newPassword?.message}>
                <Input
                  type="password"
                  name="newPassword"
                  ref={register({
                    required: 'Nouveau mot de passe requis',
                    validate: {
                      confirm: (v) => v === getValues().confirmNew || 'Les mots de passe doivent correspondre',
                      old: (v) => v !== getValues().oldPassword || `Le nouveau mot de passe doit être différent.`,
                    },
                  })}
                />
              </Field>

              <Field
                label="Confirmer le mot de passe"
                invalid={!!errors.confirmNew}
                error={errors?.confirmNew?.message}
              >
                <Input
                  type="password"
                  name="confirmNew"
                  ref={register({
                    required: 'Confirmer le mot de passe requis',
                    validate: (v) => v === getValues().newPassword || 'Les mots de passe doivent correspondre',
                  })}
                />
              </Field>
              <HorizontalGroup>
                <Button variant="primary" disabled={isSaving}>
                  Changer
                </Button>
                <LinkButton variant="secondary" href={`${config.appSubUrl}/profile`}>
                  Annuler
                </LinkButton>
              </HorizontalGroup>
            </>
          );
        }}
      </Form>
    </div>
  );
};
