'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import VehicleSearchForm from './VehicleSearchForm';
import VehicleList from './VehicleList';

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
    // Render a skeleton or loading state on the server and initial client render
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
                {/* Skeleton for search form */}
            </div>
            <div className="md:col-span-3">
                {/* Skeleton for vehicle list */}
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        <VehicleSearchForm filters={filters} onFilterChange={setFilters} />
      </aside>
      <div className="md:col-span-3">
        <VehicleList vehicles={filteredVehicles} />
      </div>
    </div>
  );
}
