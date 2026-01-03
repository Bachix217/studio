import type { Vehicle } from './types';
import { collection, getDocs, doc, getDoc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { serializeTimestamps } from './serialization';


export const initialVehicles: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>[] = [
  // @ts-nocheck
  {
    make: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    price: 32000,
    mileage: 45000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'ZH',
    description: 'Belle VW Golf 8, bien entretenue. Service suivi. Pneus d\'été et d\'hiver.',
    features: ['Climatisation automatique', 'Sièges chauffants', 'Apple CarPlay', 'Android Auto', 'Régulateur de vitesse adaptatif'],
    images: [
      'https://picsum.photos/seed/golf1/1200/800',
      'https://picsum.photos/seed/golf2/1200/800',
      'https://picsum.photos/seed/golf3/1200/800'
    ]
  },
  {
    make: 'Audi',
    model: 'Q5',
    year: 2019,
    price: 45000,
    mileage: 60000,
    fuelType: 'Diesel',
    gearbox: 'Automatique',
    canton: 'GE',
    description: 'Audi Q5 S-Line avec de nombreuses options. Expertise du jour. Non-fumeur.',
    features: ['Toit panoramique', 'Phares LED Matrix', 'Virtual Cockpit', 'Système audio Bang & Olufsen'],
    images: [
      'https://picsum.photos/seed/audi1/1200/800',
      'https://picsum.photos/seed/audi2/1200/800'
    ]
  },
  {
    make: 'BMW',
    model: '330i',
    year: 2022,
    price: 55000,
    mileage: 15000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'VD',
    description: 'BMW Série 3 comme neuve. Pack M Sport. Garantie constructeur.',
    features: ['Affichage tête haute', 'Suspension adaptative M', 'Caméra 360°', 'Accès confort'],
    images: [
      'https://picsum.photos/seed/bmw1/1200/800',
      'https://picsum.photos/seed/bmw2/1200/800',
      'https://picsum.photos/seed/bmw3/1200/800'
    ]
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 48000,
    mileage: 25000,
    fuelType: 'Électrique',
    gearbox: 'Automatique',
    canton: 'BE',
    description: 'Tesla Model 3 Long Range. Autopilot amélioré. En parfait état.',
    features: ['Autopilot', 'Intérieur Premium blanc', 'Jantes Sport 19"', 'Pompe à chaleur'],
    images: [
      'https://picsum.photos/seed/tesla1/1200/800',
      'https://picsum.photos/seed/tesla2/1200/800'
    ]
  },
  {
    make: 'Mercedes-Benz',
    model: 'A 250',
    year: 2020,
    price: 38500,
    mileage: 52000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'BS',
    description: 'Superbe Mercedes Classe A Pack AMG. Éclairage d\'ambiance. MBUX.',
    features: ['Pack Nuit AMG', 'Sièges sport', 'Toit ouvrant', 'Intégration smartphone'],
    images: [
      'https://picsum.photos/seed/merc1/1200/800'
    ]
  },
   {
    make: 'Porsche',
    model: '911 Carrera',
    year: 2018,
    price: 115000,
    mileage: 38000,
    fuelType: 'Essence',
    gearbox: 'Automatique',
    canton: 'ZG',
    description: 'Iconique Porsche 911 (991.2) en excellent état. Échappement sport. Pack Sport Chrono.',
    features: ['Échappement sport', 'Pack Sport Chrono', 'Sièges sport Plus', 'Porsche Active Suspension Management (PASM)'],
    images: [
      'https://picsum.photos/seed/porsche1/1200/800',
      'https://picsum.photos/seed/porsche2/1200/800',
      'https://picsum.photos/seed/porsche3/1200/800'
    ]
  },
];


export const getVehicles = async (firestore: any): Promise<Vehicle[]> => {
  try {
    const vehiclesCollection = collection(firestore, 'vehicles');
    const q = query(
      vehiclesCollection, 
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('No matching documents.');
      return [];
    }
    const vehicles: Vehicle[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    return serializeTimestamps(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles from Firestore:", error);
    return []; // Return empty array on error
  }
};

export const getVehicleById = async (firestore: any, id: string): Promise<Vehicle | null> => {
  try {
    const docRef = doc(firestore, 'vehicles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().published === true) {
      const vehicleData = { id: docSnap.id, ...docSnap.data() } as Vehicle;
      return serializeTimestamps(vehicleData);
    } else {
      console.log("No such published document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching vehicle by ID from Firestore:", error);
    return null;
  }
};

export const getMakes = async (firestore: any): Promise<string[]> => {
  const vehicles = await getVehicles(firestore); // Already filters by published
  const allMakes = vehicles.map(v => v.make);
  return [...new Set(allMakes)].sort();
}

export const getModelsByMake = async (firestore: any, make: string): Promise<string[]> => {
  if (!make) return [];
  const vehiclesCollection = collection(firestore, 'vehicles');
  const q = query(vehiclesCollection, where('make', '==', make), where('published', '==', true));
  const snapshot = await getDocs(q);
   if (snapshot.empty) {
      return [];
    }
  const vehicles: Vehicle[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
  return [...new Set(vehicles.map(v => v.model))].sort();
}
