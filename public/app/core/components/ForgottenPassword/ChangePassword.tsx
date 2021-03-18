import React, { FC, SyntheticEvent } from 'react';
import { Tooltip, Form, Field, Input, VerticalGroup, Button } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import { submitButton } from '../Login/LoginForm';
interface Props {
  onSubmit: (pw: string) => void;
  onSkip?: (event?: SyntheticEvent) => void;
}

interface PasswordDTO {
  newPassword: string;
  confirmNew: string;
}

export const ChangePassword: FC<Props> = ({ onSubmit, onSkip }) => {
  const submit = (passwords: PasswordDTO) => {
    onSubmit(passwords.newPassword);
  };
  return (
    <Form onSubmit={submit}>
      {({ errors, register, getValues }) => (
        <>
          <Field label="Nouveau mot de passe" invalid={!!errors.newPassword} error={errors?.newPassword?.message}>
            <Input
              autoFocus
              type="password"
              name="newPassword"
              ref={register({
                required: 'Nouveau mot de passe requis',
              })}
            />
          </Field>
          <Field
            label="Confirmer le nouveau mot de passe"
            invalid={!!errors.confirmNew}
            error={errors?.confirmNew?.message}
          >
            <Input
              type="password"
              name="confirmNew"
              ref={register({
                required: 'Confirmed password is required',
                validate: (v) => v === getValues().newPassword || 'Passwords must match!',
              })}
            />
          </Field>
          <VerticalGroup>
            <Button type="submit" className={submitButton}>
              Envoyer
            </Button>

            {onSkip && (
              <Tooltip
                content="Si vous sauter cette étape, elle vous sera demander à la prochaine connexion."
                placement="bottom"
              >
                <Button variant="link" onClick={onSkip} type="button" aria-label={selectors.pages.Login.skip}>
                  Sauter
                </Button>
              </Tooltip>
            )}
          </VerticalGroup>
        </>
      )}
    </Form>
  );
};
