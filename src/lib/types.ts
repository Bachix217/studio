import { Timestamp } from "firebase/firestore";
import { CONDITION_TYPES, DRIVE_TYPES, DOORS_TYPES, FUEL_TYPES, GEARBOX_TYPES, SEATS_TYPES, POWER_UNITS, EXTERIOR_COLORS, INTERIOR_COLORS } from "./constants";


export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: typeof FUEL_TYPES[number];
  gearbox: typeof GEARBOX_TYPES[number];
  canton: string;
  description: string;
  features: string[];
  images: string[];
  userId: string;
  createdAt: Timestamp;
  // New fields
  doors: typeof DOORS_TYPES[number];
  seats: typeof SEATS_TYPES[number];
  drive: typeof DRIVE_TYPES[number];
  power: number;
  powerUnit: typeof POWER_UNITS[number];
  exteriorColor: typeof EXTERIOR_COLORS[number];
  interiorColor: typeof INTERIOR_COLORS[number];
  condition: typeof CONDITION_TYPES[number];
  nonSmoker: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  sharePhoneNumber?: boolean;
  createdAt: Timestamp | Date;
  userType?: 'particulier' | 'professionnel';
  companyName?: string;
  address?: string;
  website?: string;
};

export type Favorite = {
  vehicleId: string;
  createdAt: Timestamp;
}
