'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import VehicleSearchForm from './VehicleSearchForm';
import VehicleList from './VehicleList';
import { Skeleton } from '@/components/ui/skeleton';

export type Filters = {
  make?: string;
  model?: string;
  priceRange?: number[];
  mileageRange?: number[];
  yearRange?: number[];
  fuelType?: string;
  gearbox?: string;
  canton?: string;
};

export default function HomePageClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 200000],
    mileageRange: [0, 300000],
    yearRange: [1990, new Date().getFullYear()],
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredVehicles = useMemo(() => {
    return initialVehicles.filter(v => {
      if (filters.make && v.make !== filters.make) return false;
      if (filters.model && v.model !== filters.model) return false;
      if (filters.priceRange && (v.price < filters.priceRange[0] || v.price > filters.priceRange[1])) return false;
      if (filters.mileageRange && (v.mileage < filters.mileageRange[0] || v.mileage > filters.mileageRange[1])) return false;
      if (filters.yearRange && (v.year < filters.yearRange[0] || v.year > filters.yearRange[1])) return false;
      if (filters.fuelType && v.fuelType !== filters.fuelType) return false;
      if (filters.gearbox && v.gearbox !== filters.gearbox) return false;
      if (filters.canton && v.canton !== filters.canton) return false;
      return true;
    });
  }, [filters, initialVehicles]);

  if (!isMounted) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
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
      <VehicleSearchForm filters={filters} onFilterChange={setFilters} />
      <VehicleList vehicles={filteredVehicles} />
    </div>
  );
}
