import type { Vehicle } from './types';

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Volkswagen',
    model: 'Golf 8',
    year: 2021,
    price: 32000,
    mileage: 45000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'VD',
    description: 'Magnifique Volkswagen Golf 8, bien entretenue, avec de nombreuses options. Idéale pour la ville et les longs trajets. Service à jour.',
    features: ['Climatisation auto', 'Apple CarPlay', 'Régulateur de vitesse adaptatif', 'Sièges chauffants'],
    images: [
      'https://picsum.photos/seed/car1-1/1200/800',
      'https://picsum.photos/seed/car1-2/1200/800',
      'https://picsum.photos/seed/car1-3/1200/800',
    ],
  },
  {
    id: '2',
    make: 'Audi',
    model: 'Q5',
    year: 2019,
    price: 48500,
    mileage: 62000,
    fuelType: 'Diesel',
    gearbox: 'Automatique',
    canton: 'GE',
    description: 'Audi Q5 S-Line, 4x4, parfait pour les montagnes suisses. Spacieux et confortable, avec un grand coffre. Non-fumeur.',
    features: ['4 roues motrices', 'Système de navigation', 'Toit panoramique', 'Hayon électrique'],
    images: [
      'https://picsum.photos/seed/car2-1/1200/800',
      'https://picsum.photos/seed/car2-2/1200/800',
    ],
  },
  {
    id: '3',
    make: 'BMW',
    model: 'Série 3',
    year: 2020,
    price: 41000,
    mileage: 38000,
    fuelType: 'Hybride',
    gearbox: 'Automatique',
    canton: 'ZH',
    description: 'BMW 330e berline, une combinaison parfaite de performance et d\'efficacité. Faible consommation. État impeccable.',
    features: ['Mode électrique', 'Phares LED', 'Aide au stationnement', 'Intérieur cuir'],
    images: [
      'https://picsum.photos/seed/car3-1/1200/800',
      'https://picsum.photos/seed/car3-2/1200/800',
      'https://picsum.photos/seed/car3-3/1200/800',
      'https://picsum.photos/seed/car3-4/1200/800',
    ],
  },
  {
    id: '4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 45000,
    mileage: 25000,
    fuelType: 'Électrique',
    gearbox: 'Automatique',
    canton: 'FR',
    description: 'Tesla Model 3 Standard Range Plus. Autonomie et technologie de pointe. Vendue avec pneus d\'hiver.',
    features: ['Autopilot', 'Grand écran tactile', 'Accès sans clé', 'Caméras 360°'],
    images: [
      'https://picsum.photos/seed/car4-1/1200/800',
      'https://picsum.photos/seed/car4-2/1200/800',
    ],
  },
  {
    id: '5',
    make: 'Peugeot',
    model: '208',
    year: 2020,
    price: 18000,
    mileage: 55000,
    fuelType: 'Essence',
    gearbox: 'Manuelle',
    canton: 'VS',
    description: 'Peugeot 208, voiture citadine agile et économique. Parfaite pour jeune conducteur. Tous les services ont été faits chez Peugeot.',
    features: ['Écran tactile', 'Bluetooth', 'Climatisation', 'Limiteur de vitesse'],
    images: [
      'https://picsum.photos/seed/car5-1/1200/800',
    ],
  },
  {
    id: '6',
    make: 'Mercedes-Benz',
    model: 'Classe A',
    year: 2018,
    price: 29500,
    mileage: 75000,
    fuelType: 'Diesel',
    gearbox: 'Automatique',
    canton: 'BE',
    description: 'Mercedes Classe A 200d avec pack AMG. Look sportif et intérieur luxueux. Faible kilométrage pour son année.',
    features: ['Pack AMG', 'Sièges sport', 'Éclairage d\'ambiance', 'MBUX'],
    images: [
      'https://picsum.photos/seed/car6-1/1200/800',
      'https://picsum.photos/seed/car6-2/1200/800',
      'https://picsum.photos/seed/car6-3/1200/800',
    ],
  },
  {
    id: '7',
    make: 'Fiat',
    model: '500',
    year: 2021,
    price: 16500,
    mileage: 22000,
    fuelType: 'Hybride',
    gearbox: 'Manuelle',
    canton: 'TI',
    description: 'Adorable Fiat 500 Hybrid, la voiture de ville par excellence. Très faible consommation. Comme neuve.',
    features: ['Toit en verre', 'Uconnect 7"', 'Mode City', 'Jantes alliage'],
    images: [
      'https://picsum.photos/seed/car7-1/1200/800',
      'https://picsum.photos/seed/car7-2/1200/800',
    ],
  },
  {
    id: '8',
    make: 'Porsche',
    model: '911',
    year: 2017,
    price: 115000,
    mileage: 42000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'ZG',
    description: 'Porsche 911 Carrera (991.2). Un rêve de conduite. Carnet de service complet Porsche. Jamais accidentée.',
    features: ['Échappement sport', 'Pack Chrono Sport', 'Suspension PASM', 'Son BOSE'],
    images: [
      'https://picsum.photos/seed/car8-1/1200/800',
      'https://picsum.photos/seed/car8-2/1200/800',
      'https://picsum.photos/seed/car8-3/1200/800',
    ],
  },
  {
    id: '9',
    make: 'Renault',
    model: 'Zoe',
    year: 2019,
    price: 15000,
    mileage: 60000,
    fuelType: 'Électrique',
    gearbox: 'Automatique',
    canton: 'NE',
    description: 'Renault Zoe, 100% électrique, parfaite pour les trajets quotidiens. Batterie en location (non incluse dans le prix).',
    features: ['Charge rapide', 'GPS intégré', 'Pompe à chaleur', 'Entrée sans clé'],
    images: [
      'https://picsum.photos/seed/car9-1/1200/800',
      'https://picsum.photos/seed/car9-2/1200/800',
    ],
  },
  {
    id: '10',
    make: 'Skoda',
    model: 'Octavia',
    year: 2020,
    price: 26000,
    mileage: 80000,
    fuelType: 'Diesel',
    gearbox: 'Automatique',
    canton: 'LU',
    description: 'Skoda Octavia Combi, un volume incroyable et un confort de première classe. Idéale pour les familles. Moteur diesel très sobre.',
    features: ['Grand coffre', 'Android Auto', 'Phares LED Matrix', 'Virtual Cockpit'],
    images: [
      'https://picsum.photos/seed/car10-1/1200/800',
      'https://picsum.photos/seed/car10-2/1200/800',
      'https://picsum.photos/seed/car10-3/1200/800',
    ],
  },
];

// Simulate API delay
export const getVehicles = async (): Promise<Vehicle[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockVehicles;
};

export const getVehicleById = async (id: string): Promise<Vehicle | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockVehicles.find(v => v.id === id);
};

export const getMakes = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...new Set(mockVehicles.map(v => v.make))].sort();
}

export const getModelsByMake = async (make: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (!make) return [];
  return [...new Set(mockVehicles.filter(v => v.make === make).map(v => v.model))].sort();
}
