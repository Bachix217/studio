'use client';

import React, { useState, useEffect } from 'react';
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
import { CANTONS, FUEL_TYPES, GEARBOX_TYPES } from '@/lib/constants';
import { getMakes, getModelsByMake } from '@/lib/data';
import { Filters } from './HomePageClient';
import { formatCurrency } from '@/lib/utils';
import { RotateCcw, SlidersHorizontal, Search } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase';

interface VehicleSearchFormProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const defaultFilters: Filters = {
  make: '',
  model: '',
  priceRange: [0, 200000],
  mileageRange: [0, 300000],
  yearRange: [1990, new Date().getFullYear()],
  fuelType: '',
  gearbox: '',
  canton: '',
};

export default function VehicleSearchForm({
  filters,
  onFilterChange,
}: VehicleSearchFormProps) {
  const { firestore } = useFirebase();
  const { control, watch, reset, setValue } = useForm<Filters>({
    defaultValues: filters,
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  const selectedMake = watch('make');

  useEffect(() => {
    if (!firestore) return;
    const fetchMakes = async () => {
      const makesData = await getMakes(firestore);
      setMakes(makesData);
    };
    fetchMakes();
  }, [firestore]);

  useEffect(() => {
    if (!firestore) return;
    const fetchModels = async () => {
      if (selectedMake) {
        const modelsData = await getModelsByMake(firestore, selectedMake);
        setModels(modelsData);
      } else {
        setModels([]);
      }
    };
    fetchModels();
    setValue('model', '');
  }, [selectedMake, setValue, firestore]);

  useEffect(() => {
    const subscription = watch(value => {
      onFilterChange(value as Filters);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange]);

  const handleReset = () => {
    reset(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const currentPriceRange = watch('priceRange') || defaultFilters.priceRange;
  const currentMileageRange =
    watch('mileageRange') || defaultFilters.mileageRange;
  const currentYearRange = watch('yearRange') || defaultFilters.yearRange;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-muted-foreground">
              Marque
            </label>
            <Controller
              name="make"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value =>
                    field.onChange(value === 'all' ? '' : value)
                  }
                  value={field.value || 'all'}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Toutes les marques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les marques</SelectItem>
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

          <div className="lg:col-span-3">
            <label className="text-sm font-medium text-muted-foreground">
              Modèle
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value =>
                    field.onChange(value === 'all' ? '' : value)
                  }
                  value={field.value || 'all'}
                  disabled={!selectedMake || models.length === 0}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous les modèles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modèles</SelectItem>
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

          <div className="lg:col-span-4">
            <label className="text-sm font-medium text-muted-foreground">
              Canton
            </label>
            <Controller
              name="canton"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={value =>
                    field.onChange(value === 'all' ? '' : value)
                  }
                  value={field.value || 'all'}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Toute la Suisse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toute la Suisse</SelectItem>
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

          <div className="lg:col-span-2">
            <Button size="lg" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </div>

        <Collapsible
          open={isAdvancedSearchOpen}
          onOpenChange={setIsAdvancedSearchOpen}
          className="w-full mt-4"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto text-primary flex items-center gap-2"
            >
              <SlidersHorizontal size={16} />
              Recherche avancée
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-6">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Prix</label>
                <Controller
                  name="priceRange"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={0}
                      max={200000}
                      step={1000}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{formatCurrency(currentPriceRange![0])}</span>
                  <span>{formatCurrency(currentPriceRange![1])}</span>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Carburant</label>
                <Controller
                  name="fuelType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={value =>
                        field.onChange(value === 'all' ? '' : value)
                      }
                      value={field.value || 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Boîte</label>
                <Controller
                  name="gearbox"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={value =>
                        field.onChange(value === 'all' ? '' : value)
                      }
                      value={field.value || 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
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

              <div>
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
