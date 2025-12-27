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
