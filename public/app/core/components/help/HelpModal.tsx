import React from 'react';
import { appEvents } from 'app/core/core';
import { Icon } from '@grafana/ui';

export class HelpModal extends React.PureComponent {
  static tabIndex = 0;
  static shortcuts = {
    Globale: [
      { keys: ['g', 'h'], description: "Aller à l'accueil" },
      { keys: ['g', 'p'], description: 'Aller au profil' },
      { keys: ['s', 'o'], description: 'Ouvrir rechercher' },
      { keys: ['esc'], description: 'Quitter vue edition / option' },
    ],
    Tableaux: [
      { keys: ['mod+s'], description: 'Sauvegarder tableau' },
      { keys: ['d', 'r'], description: 'Rafraichir tout les panneaux' },
      { keys: ['d', 's'], description: 'Options tableaux' },
      { keys: ['d', 'v'], description: 'Basculer in-active / view mode' },
      { keys: ['d', 'k'], description: 'Basculer mode kiosque (cache la bar haute)' },
      { keys: ['d', 'E'], description: 'Etirer toutes les lignes' },
      { keys: ['d', 'C'], description: 'Réduire toutes les lignes' },
      { keys: ['d', 'a'], description: "Basculer l'autofit des panneaux (fonction expérimentale)" },
      { keys: ['mod+o'], description: 'Basculer le curseur de graphique partagé' },
      { keys: ['d', 'l'], description: 'Basculer les légendes de tout les panneaux' },
    ],
    Panneaux: [
      { keys: ['e'], description: 'Basculer la vue édition du panneau' },
      { keys: ['v'], description: 'Basculer la vue plein écran du panneau' },
      { keys: ['p', 's'], description: 'Ouvrir le module de partage de panneau' },
      { keys: ['p', 'd'], description: 'Dupliquer le panneau' },
      { keys: ['p', 'r'], description: 'Enlever le panneau' },
      { keys: ['p', 'l'], description: 'Basculer la légende du panneau' },
    ],
    Temps: [
      { keys: ['t', 'z'], description: 'Zoom arrière sur la plage de temps' },
      {
        keys: ['t', '←'],
        description: 'Reculer la plage de temps',
      },
      {
        keys: ['t', '→'],
        description: 'Avancer la plage de temps',
      },
    ],
  };

  dismiss() {
    appEvents.emit('hide-modal');
  }

  render() {
    return (
      <div className="modal-body">
        <div className="modal-header">
          <h2 className="modal-header-title">
            <Icon name="keyboard" size="lg" />
            <span className="p-l-1">Raccourcis</span>
          </h2>
          <a className="modal-header-close" onClick={this.dismiss}>
            <Icon name="times" style={{ margin: '3px 0 0 0' }} />
          </a>
        </div>

        <div className="modal-content help-modal">
          <p className="small" style={{ position: 'absolute', top: '13px', right: '44px' }}>
            <span className="shortcut-table-key">mod</span> =
            <span className="muted"> CTRL sur windows ou linux et CMD sur Mac</span>
          </p>

          {Object.entries(HelpModal.shortcuts).map(([category, shortcuts], i) => (
            <div className="shortcut-category" key={i}>
              <table className="shortcut-table">
                <tbody>
                  <tr>
                    <th className="shortcut-table-category-header" colSpan={2}>
                      {category}
                    </th>
                  </tr>
                  {shortcuts.map((shortcut, j) => (
                    <tr key={`${i}-${j}`}>
                      <td className="shortcut-table-keys">
                        {shortcut.keys.map((key, k) => (
                          <span className="shortcut-table-key" key={`${i}-${j}-${k}`}>
                            {key}
                          </span>
                        ))}
                      </td>
                      <td className="shortcut-table-description">{shortcut.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="clearfix" />
        </div>
      </div>
    );
  }
}
