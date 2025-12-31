import { Timestamp } from "firebase/firestore";

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
  gearbox: 'Manuelle' | 'Automatique';
  canton: string;
  description: string;
  features: string[];
  images: string[];
  userId: string;
  createdAt: Timestamp;
  // New fields
  doors: 3 | 5;
  seats: 2 | 5 | 7;
  drive: 'Traction avant' | 'Propulsion' | '4x4';
  power: number;
  powerUnit: 'cv' | 'kw';
  exteriorColor: string;
  interiorColor: string;
  condition: 'Neuf' | 'Occasion' | 'Véhicule de démonstration';
  nonSmoker: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  sharePhoneNumber?: boolean;
  createdAt: Timestamp | Date;
  userType?: 'particulier' | 'professionnel';
  companyName?: string;
  address?: string;
  website?: string;
};
