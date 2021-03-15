import React, { PureComponent } from 'react';
import { UserDTO, UserSession } from 'app/types';
import { LoadingPlaceholder, Button, Icon } from '@grafana/ui';

export interface Props {
  user: UserDTO;
  sessions: UserSession[];
  isLoading: boolean;
  loadSessions: () => void;
  revokeUserSession: (tokenId: number) => void;
}

export class UserSessions extends PureComponent<Props> {
  componentDidMount() {
    this.props.loadSessions();
  }

  render() {
    const { isLoading, sessions, revokeUserSession } = this.props;

    if (isLoading) {
      return <LoadingPlaceholder text="Loading sessions..." />;
    }

    return (
      <>
        {sessions.length > 0 && (
          <>
            <h3 className="page-sub-heading">Sessions</h3>
            <div className="gf-form-group">
              <table className="filter-table form-inline">
                <thead>
                  <tr>
                    <th>Vu en dernier</th>
                    <th>Connecté</th>
                    <th>Adresse IP</th>
                    <th>Navigateur &amp; OS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session: UserSession, index) => (
                    <tr key={index}>
                      {session.isActive ? <td>Maintenant</td> : <td>{session.seenAt}</td>}
                      <td>{session.createdAt}</td>
                      <td>{session.clientIp}</td>
                      <td>
                        {session.browser} sur {session.os} {session.osVersion}
                      </td>
                      <td>
                        <Button size="sm" variant="destructive" onClick={() => revokeUserSession(session.id)}>
                          <Icon name="power" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  }
}

export default UserSessions;
