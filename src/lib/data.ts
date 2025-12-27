import type { Vehicle } from './types';
import { collection, getDocs, doc, getDoc, query, orderBy, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// This file now fetches data from Firestore instead of using mocks.

// We get the firestore instance on the client.
// const { firestore } = initializeFirebase();

// The mockVehicles array is kept for data structure reference and potential fallback, but is not actively used.
const mockVehicles: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>[] = [
  // ... mock data from previous version can be kept here for reference if needed
];


export const getVehicles = async (firestore: any): Promise<Vehicle[]> => {
  try {
    const vehiclesCollection = collection(firestore, 'vehicles');
    const q = query(vehiclesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('No matching documents.');
      return [];
    }
    const vehicles: Vehicle[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles from Firestore:", error);
    return []; // Return empty array on error
  }
};

export const getVehicleById = async (firestore: any, id: string): Promise<Vehicle | undefined> => {
  try {
    const docRef = doc(firestore, 'vehicles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vehicle;
    } else {
      console.log("No such document!");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching vehicle by ID from Firestore:", error);
    return undefined;
  }
};

export const getMakes = async (firestore: any): Promise<string[]> => {
  const vehicles = await getVehicles(firestore);
  return [...new Set(vehicles.map(v => v.make))].sort();
}

export const getModelsByMake = async (firestore: any, make: string): Promise<string[]> => {
  if (!make) return [];
  const vehiclesCollection = collection(firestore, 'vehicles');
  const q = query(vehiclesCollection, where('make', '==', make));
  const snapshot = await getDocs(q);
   if (snapshot.empty) {
      return [];
    }
  const vehicles: Vehicle[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
  return [...new Set(vehicles.map(v => v.model))].sort();
}
