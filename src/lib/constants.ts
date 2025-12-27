import type { Vehicle } from './types';

export const CANTONS = [
  { value: 'AG', label: 'Argovie' },
  { value: 'AI', label: 'Appenzell Rhodes-Intérieures' },
  { value: 'AR', label: 'Appenzell Rhodes-Extérieures' },
  { value: 'BE', label: 'Berne' },
  { value: 'BL', label: 'Bâle-Campagne' },
  { value: 'BS', label: 'Bâle-Ville' },
  { value: 'FR', label: 'Fribourg' },
  { value: 'GE', label: 'Genève' },
  { value: 'GL', label: 'Glaris' },
  { value: 'GR', label: 'Grisons' },
  { value: 'JU', label: 'Jura' },
  { value: 'LU', label: 'Lucerne' },
  { value: 'NE', label: 'Neuchâtel' },
  { value: 'NW', label: 'Nidwald' },
  { value: 'OW', label: 'Obwald' },
  { value: 'SG', label: 'Saint-Gall' },
  { value: 'SH', label: 'Schaffhouse' },
  { value: 'SO', label: 'Soleure' },
  { value: 'SZ', label: 'Schwyz' },
  { value: 'TG', label: 'Thurgovie' },
  { value: 'TI', label: 'Tessin' },
  { value: 'UR', label: 'Uri' },
  { value: 'VD', label: 'Vaud' },
  { value: 'VS', label: 'Valais' },
  { value: 'ZG', label: 'Zoug' },
  { value: 'ZH', label: 'Zurich' },
];

export const FUEL_TYPES: Vehicle['fuelType'][] = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
export const GEARBOX_TYPES: Vehicle['gearbox'][] = ['Manuelle', 'Automatique'];
