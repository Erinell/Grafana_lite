import React, { FC } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import Page from 'app/core/components/Page/Page';
import { Button, Input, Field, Form } from '@grafana/ui';
import { getConfig } from 'app/core/config';
import { StoreState } from 'app/types';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { NavModel } from '@grafana/data';
import { getNavModel } from '../../core/selectors/navModel';

const createOrg = async (newOrg: { name: string }) => {
  const result = await getBackendSrv().post('/api/orgs/', newOrg);

  await getBackendSrv().post('/api/user/using/' + result.orgId);
  window.location.href = getConfig().appSubUrl + '/org';
};

const validateOrg = async (orgName: string) => {
  try {
    await getBackendSrv().get(`api/orgs/name/${encodeURI(orgName)}`);
  } catch (error) {
    if (error.status === 404) {
      error.isHandled = true;
      return true;
    }
    return 'Something went wrong';
  }
  return 'Organization already exists';
};

interface PropsWithState {
  navModel: NavModel;
}

interface CreateOrgFormDTO {
  name: string;
}

export const NewOrgPage: FC<PropsWithState> = ({ navModel }) => {
  return (
    <Page navModel={navModel}>
      <Page.Contents>
        <h3 className="page-sub-heading">Nouvelle organisation</h3>

        <p className="playlist-description">
          Chaque organisation contient ses propres tableaux de bord, sources de données et configuration, et ne peut pas
          être partagée entre orgs.{' '}
        </p>

        <Form<CreateOrgFormDTO> onSubmit={createOrg}>
          {({ register, errors }) => {
            return (
              <>
                <Field label="Nom de l'organisation" invalid={!!errors.name} error={errors.name && errors.name.message}>
                  <Input
                    placeholder="Nom"
                    name="name"
                    ref={register({
                      required: "Nom de l'organisation requis",
                      validate: async (orgName) => await validateOrg(orgName),
                    })}
                  />
                </Field>
                <Button type="submit">Créer</Button>
              </>
            );
          }}
        </Form>
      </Page.Contents>
    </Page>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { navModel: getNavModel(state.navIndex, 'global-orgs') };
};

export default hot(module)(connect(mapStateToProps)(NewOrgPage));
