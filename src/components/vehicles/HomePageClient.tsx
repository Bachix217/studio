'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import VehicleSearchForm from './VehicleSearchForm';
import VehicleList from './VehicleList';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { EXTERIOR_COLORS, INTERIOR_COLORS } from '@/lib/constants';

export type Filters = {
  make?: string;
  model?: string;
  priceRange?: (number | undefined)[];
  mileageRange?: number[];
  yearRange?: number[];
  powerRange?: number[];
  fuelType?: string;
  gearbox?: string;
  canton?: string;
  drive?: string;
  seats?: number;
  condition?: string;
  exteriorColor?: typeof EXTERIOR_COLORS[number];
  interiorColor?: typeof INTERIOR_COLORS[number];
};

const initialFilters: Filters = {
  make: undefined,
  model: undefined,
  priceRange: [0, 200000],
  mileageRange: [0, 300000],
  yearRange: [1990, new Date().getFullYear()],
  powerRange: [10, 800],
  fuelType: undefined,
  gearbox: undefined,
  canton: undefined,
  drive: undefined,
  seats: undefined,
  condition: undefined,
  exteriorColor: undefined,
  interiorColor: undefined,
};


export default function HomePageClient() {
  const { firestore } = useFirebase();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);
    const vehiclesCollection = collection(firestore, 'vehicles');
    
    const q = query(vehiclesCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      setVehicles(vehiclesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vehicles: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);


  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (!v) return false;
      
      const {
        make,
        model,
        priceRange,
        mileageRange,
        yearRange,
        powerRange,
        fuelType,
        gearbox,
        canton,
        drive,
        seats,
        condition,
        exteriorColor,
        interiorColor,
      } = filters;

      const [minPrice, maxPrice] = priceRange || [undefined, undefined];

      if (make && v.make !== make) return false;
      if (model && v.model !== model) return false;

      if (typeof minPrice === 'number' && v.price < minPrice) return false;
      if (typeof maxPrice === 'number' && v.price > maxPrice) return false;
      
      if (mileageRange && (v.mileage < mileageRange[0] || v.mileage > mileageRange[1])) return false;
      if (yearRange && (v.year < yearRange[0] || v.year > yearRange[1])) return false;
      if (powerRange && (v.power < powerRange[0] || v.power > powerRange[1])) return false;
      
      if (fuelType && v.fuelType !== fuelType) return false;
      if (gearbox && v.gearbox !== gearbox) return false;
      if (canton && v.canton !== canton) return false;
      if (drive && v.drive !== drive) return false;
      if (seats && v.seats !== seats) return false;
      if (condition && v.condition !== condition) return false;
      if (exteriorColor && v.exteriorColor !== exteriorColor) return false;
      if (interiorColor && v.interiorColor !== interiorColor) return false;
      
      return true;
    });
  }, [filters, vehicles]);

  if (loading) {
    return (
      <div className="space-y-8">
        <VehicleSearchForm filters={filters} onFilterChange={setFilters} allVehicles={vehicles} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <VehicleSearchForm filters={filters} onFilterChange={setFilters} allVehicles={vehicles} />
      <VehicleList vehicles={filteredVehicles} />
    </div>
  );
}
