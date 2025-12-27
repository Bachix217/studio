'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import VehicleSearchForm from './VehicleSearchForm';
import VehicleList from './VehicleList';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export type Filters = {
  make?: string;
  model?: string;
  priceRange?: (number | undefined)[];
  mileageRange?: number[];
  yearRange?: number[];
  fuelType?: string;
  gearbox?: string;
  canton?: string;
};

const initialFilters: Filters = {
  make: undefined,
  model: undefined,
  priceRange: [undefined, undefined],
  mileageRange: [0, 300000],
  yearRange: [1990, new Date().getFullYear()],
  fuelType: undefined,
  gearbox: undefined,
  canton: undefined,
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
      const makeFilter = filters.make;
      const modelFilter = filters.model;
      const fuelTypeFilter = filters.fuelType;
      const gearboxFilter = filters.gearbox;
      const cantonFilter = filters.canton;

      const [minPrice, maxPrice] = filters.priceRange || [undefined, undefined];

      if (makeFilter && v.make !== makeFilter) return false;
      if (modelFilter && v.model !== modelFilter) return false;

      if (typeof minPrice === 'number' && v.price < minPrice) return false;
      if (typeof maxPrice === 'number' && v.price > maxPrice) return false;
      
      if (filters.mileageRange && (v.mileage < filters.mileageRange[0] || v.mileage > filters.mileageRange[1])) return false;
      if (filters.yearRange && (v.year < filters.yearRange[0] || v.year > filters.yearRange[1])) return false;
      if (fuelTypeFilter && v.fuelType !== fuelTypeFilter) return false;
      if (gearboxFilter && v.gearbox !== gearboxFilter) return false;
      if (cantonFilter && v.canton !== cantonFilter) return false;
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
