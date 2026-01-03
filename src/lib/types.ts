import { FieldValue, Timestamp } from "firebase/firestore";
import { CONDITION_TYPES, DRIVE_TYPES, DOORS_TYPES, FUEL_TYPES, GEARBOX_TYPES, SEATS_TYPES, POWER_UNITS, EXTERIOR_COLORS, INTERIOR_COLORS } from "./constants";

// This is a utility type that will recursively make all Timestamp fields a union of Timestamp and string.
type WithSerializableTimestamps<T> = {
  [K in keyof T]: T[K] extends Timestamp | FieldValue | undefined
    ? T[K] | string
    : T[K];
};

export type Vehicle = WithSerializableTimestamps<{
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
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
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
  // Moderation fields
  status: 'pending' | 'approved' | 'rejected';
  published: boolean;
}>;

export type UserProfile = WithSerializableTimestamps<{
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  sharePhoneNumber?: boolean;
  createdAt?: Timestamp | FieldValue;
  userType?: 'particulier' | 'professionnel';
  companyName?: string;
  address?: string;
  website?: string;
}>;

export type Favorite = WithSerializableTimestamps<{
  vehicleId: string;
  createdAt: Timestamp | FieldValue;
}>;
