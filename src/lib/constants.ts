
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

export const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'] as const;
export const GEARBOX_TYPES = ['Manuelle', 'Automatique'] as const;
export const DOORS_TYPES = [3, 5] as const;
export const SEATS_TYPES = [2, 5, 7] as const;
export const DRIVE_TYPES = ['Traction avant', 'Propulsion', '4x4'] as const;
export const CONDITION_TYPES = ['Neuf', 'Occasion', 'Véhicule de démonstration'] as const;
export const POWER_UNITS = ['cv', 'kw'] as const;

export const EXTERIOR_COLORS = ['Noir', 'Blanc', 'Gris', 'Argenté', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Orange', 'Brun', 'Beige', 'Violet', 'Autre'] as const;
export const INTERIOR_COLORS = ['Noir', 'Gris', 'Beige', 'Brun', 'Blanc', 'Rouge', 'Bleu', 'Autre'] as const;

export const COMMON_VEHICLE_FEATURES = [
  'Climatisation',
  'Bluetooth',
  'Régulateur de vitesse',
  'Sièges chauffants',
  'Caméra de recul',
  'Toit ouvrant',
  'Apple CarPlay',
  'Android Auto',
  'GPS',
  'Phares LED',
  'Système d\'aide au stationnement',
  'Affichage tête haute',
  'Sièges en cuir',
  'Jantes en alliage',
  'Avertisseur d\'angle mort',
  'Accès sans clé',
  'Hayon électrique',
] as const;
