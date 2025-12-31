'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CANTONS, FUEL_TYPES, GEARBOX_TYPES, DRIVE_TYPES, SEATS_TYPES, CONDITION_TYPES, EXTERIOR_COLORS, INTERIOR_COLORS } from '@/lib/constants';
import { Filters } from './HomePageClient';
import type { Vehicle } from '@/lib/types';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const defaultFilters: Filters = {
  make: undefined,
  model: undefined,
  priceRange: [undefined, undefined],
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

interface VehicleSearchFormProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  allVehicles: Vehicle[];
}

export default function VehicleSearchForm({
  filters,
  onFilterChange,
  allVehicles,
}: VehicleSearchFormProps) {
  const { control, watch, reset, setValue } = useForm<Filters>({
    defaultValues: filters,
  });

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const selectedMake = watch('make');

  const makes = useMemo(() => {
    const vehicleMakes = allVehicles.map(v => v.make);
    return [...new Set(vehicleMakes)].sort();
  }, [allVehicles]);

  const models = useMemo(() => {
    if (!selectedMake) return [];
    const vehicleModels = allVehicles
      .filter(v => v.make === selectedMake)
      .map(v => v.model);
    return [...new Set(vehicleModels)].sort();
  }, [allVehicles, selectedMake]);

  useEffect(() => {
    if (selectedMake) {
      const currentModel = watch('model');
      if (currentModel && !models.includes(currentModel)) {
        setValue('model', undefined);
      }
    }
  }, [selectedMake, models, setValue, watch]);

  const handleReset = () => {
    reset(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  useEffect(() => {
    const subscription = watch((value) => {
      const newFilters = { ...value };
      
      const minPrice = value.priceRange?.[0] ? parseInt(value.priceRange[0] as any, 10) : undefined;
      const maxPrice = value.priceRange?.[1] ? parseInt(value.priceRange[1] as any, 10) : undefined;

      newFilters.priceRange = [
        isNaN(minPrice as number) ? undefined : minPrice,
        isNaN(maxPrice as number) ? undefined : maxPrice
      ];
      
      if (value.seats && typeof value.seats === 'string') {
        newFilters.seats = parseInt(value.seats, 10);
      }
      
      onFilterChange(newFilters as Filters);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange]);


  const currentMileageRange =
    watch('mileageRange') || defaultFilters.mileageRange;
  const currentYearRange = watch('yearRange') || defaultFilters.yearRange;
  const currentPowerRange = watch('powerRange') || defaultFilters.powerRange;

  return (
    <Card className="shadow-lg overflow-hidden">
        <form>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Marque
                </label>
                <Controller
                  name="make"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('model', undefined); 
                      }}
                      value={field.value || ''}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Toutes les marques" />
                      </SelectTrigger>
                      <SelectContent>
                        {makes.map(make => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Modèle
                </label>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value || ''}
                      disabled={!selectedMake || models.length === 0}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tous les modèles" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Carburant</label>
                    <Controller
                      name="fuelType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            {FUEL_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                 </div>
                 <div>
                    <label className="text-sm font-medium text-muted-foreground">Boîte</label>
                    <Controller
                      name="gearbox"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {GEARBOX_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
               </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Canton
                </label>
                <Controller
                  name="canton"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value || ''}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Toute la Suisse" />
                      </SelectTrigger>
                      <SelectContent>
                        {CANTONS.map(canton => (
                          <SelectItem key={canton.value} value={canton.value}>
                            {canton.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

            </div>

            <Collapsible
              open={isAdvancedSearchOpen}
              onOpenChange={setIsAdvancedSearchOpen}
              className="w-full mt-4"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary flex items-center gap-2"
                  >
                    <SlidersHorizontal size={16} />
                    Filtres additionnels
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-6">
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Prix (CHF)</label>
                    <div className="flex items-center gap-2">
                       <Controller
                          name="priceRange.0"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="Min"
                              {...field}
                              onChange={e => field.onChange(e.target.value)}
                              value={field.value || ''}
                            />
                          )}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Controller
                          name="priceRange.1"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="Max"
                              {...field}
                              onChange={e => field.onChange(e.target.value)}
                              value={field.value || ''}
                            />
                          )}
                        />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Kilométrage</label>
                    <Controller
                      name="mileageRange"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={0}
                          max={300000}
                          step={5000}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>{currentMileageRange![0].toLocaleString('fr-CH')} km</span>
                      <span>{currentMileageRange![1].toLocaleString('fr-CH')} km</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Année</label>
                    <Controller
                      name="yearRange"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={1990}
                          max={new Date().getFullYear()}
                          step={1}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>{currentYearRange![0]}</span>
                      <span>{currentYearRange![1]}</span>
                    </div>
                  </div>
                   <div className="space-y-3">
                    <label className="text-sm font-medium">Puissance (cv)</label>
                    <Controller
                      name="powerRange"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          min={10}
                          max={800}
                          step={10}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      )}
                    />
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>{currentPowerRange![0]} cv</span>
                      <span>{currentPowerRange![1]} cv</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Traction</label>
                    <Controller
                      name="drive"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {DRIVE_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Places</label>
                    <Controller
                      name="seats"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value ? String(field.value) : ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEATS_TYPES.map(type => (
                              <SelectItem key={type} value={String(type)}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">État</label>
                    <Controller
                      name="condition"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                   <div>
                    <label className="text-sm font-medium text-muted-foreground">Couleur extérieure</label>
                    <Controller
                      name="exteriorColor"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXTERIOR_COLORS.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                   <div>
                    <label className="text-sm font-medium text-muted-foreground">Couleur intérieure</label>
                    <Controller
                      name="interiorColor"
                      control={control}
                      render={({ field }) => (
                        <Select
                           onValueChange={(value) => field.onChange(value)}
                           value={field.value || ''}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERIOR_COLORS.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                 </div>

                <div className="flex justify-end mt-6">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={handleReset}
                      type="button"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Réinitialiser les filtres
                    </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </form>
    </Card>
  );
}
