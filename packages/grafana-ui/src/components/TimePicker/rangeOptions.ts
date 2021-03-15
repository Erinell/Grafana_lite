import { TimeOption } from '@grafana/data';

export const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: 'Dernières 5 minutes', section: 3 },
  { from: 'now-15m', to: 'now', display: 'Dernières 15 minutes', section: 3 },
  { from: 'now-30m', to: 'now', display: 'Dernières 30 minutes', section: 3 },
  { from: 'now-1h', to: 'now', display: 'Dernière heure', section: 3 },
  { from: 'now-3h', to: 'now', display: 'Dernières 3 heures', section: 3 },
  { from: 'now-6h', to: 'now', display: 'Dernières 6 heures', section: 3 },
  { from: 'now-12h', to: 'now', display: 'Dernières 12 heures', section: 3 },
  { from: 'now-24h', to: 'now', display: 'Dernières 24 heures', section: 3 },
  { from: 'now-2d', to: 'now', display: 'Derniers 2 jours', section: 3 },
  { from: 'now-7d', to: 'now', display: 'Derniers 7 jours', section: 3 },
  { from: 'now-30d', to: 'now', display: 'Derniers 30 jours', section: 3 },
  { from: 'now-90d', to: 'now', display: 'Derniers 90 jours', section: 3 },
  { from: 'now-6M', to: 'now', display: 'Derniers 6 mois', section: 3 },
  { from: 'now-1y', to: 'now', display: 'Dernière année', section: 3 },
  { from: 'now-2y', to: 'now', display: 'Derniers 2 ans', section: 3 },
  { from: 'now-5y', to: 'now', display: 'Derniers 5 ans', section: 3 },
];

export const otherOptions: TimeOption[] = [
  { from: 'now-1d/d', to: 'now-1d/d', display: 'Hier', section: 3 },
  { from: 'now-2d/d', to: 'now-2d/d', display: 'Avant-Hier', section: 3 },
  { from: 'now-7d/d', to: 'now-7d/d', display: 'Ce jour il y a une semaine', section: 3 },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Semaine dernière', section: 3 },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Mois dernier', section: 3 },
  { from: 'now-1y/y', to: 'now-1y/y', display: 'An dernier', section: 3 },
  { from: 'now/d', to: 'now/d', display: "Aujourd'hui", section: 3 },
  { from: 'now/d', to: 'now', display: "Aujourd'hui jusque-là", section: 3 },
  { from: 'now/w', to: 'now/w', display: 'Cette semaine', section: 3 },
  { from: 'now/w', to: 'now', display: 'Cette semaine jusque-là', section: 3 },
  { from: 'now/M', to: 'now/M', display: 'Ce mois', section: 3 },
  { from: 'now/M', to: 'now', display: 'Ce mois jusque-là', section: 3 },
  { from: 'now/y', to: 'now/y', display: 'Cette année', section: 3 },
  { from: 'now/y', to: 'now', display: 'Cette année jusque-là', section: 3 },
];
