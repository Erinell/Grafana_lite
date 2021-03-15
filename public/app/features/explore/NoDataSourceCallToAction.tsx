import React, { useContext } from 'react';
import { css } from 'emotion';
import { ThemeContext, LinkButton, CallToActionCard, Icon } from '@grafana/ui';

export const NoDataSourceCallToAction = () => {
  const theme = useContext(ThemeContext);

  const message =
    'Explore requires at least one data source. Once you have added a data source, you can query it here.';
  const footer = (
    <>
      <Icon name="rocket" />
      <> Vous pouvez définir une source de données à partir du fichier configuration. </>
      <a
        href="http://docs.grafana.org/administration/provisioning/#datasources?utm_source=explore"
        target="_blank"
        rel="noreferrer"
        className="text-link"
      >
        Lire plus
      </a>
    </>
  );

  const ctaElement = (
    <LinkButton size="lg" href="datasources/new" icon="database">
      Ajouter une source
    </LinkButton>
  );

  const cardClassName = css`
    max-width: ${theme.breakpoints.lg};
    margin-top: ${theme.spacing.md};
    align-self: center;
  `;

  return (
    <CallToActionCard
      callToActionElement={ctaElement}
      className={cardClassName}
      footer={footer}
      message={message}
      theme={theme}
    />
  );
};
