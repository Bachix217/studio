'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CANTONS, FUEL_TYPES, GEARBOX_TYPES } from '@/lib/constants';
import { getMakes, getModelsByMake } from '@/lib/data';
import { Filters } from './HomePageClient';
import { formatCurrency } from '@/lib/utils';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export default function VehicleSearchForm({ filters, onFilterChange }: VehicleSearchFormProps) {
  const { control, watch, reset, setValue } = useForm<Filters>({
    defaultValues: filters,
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  
  const selectedMake = watch('make');

  useEffect(() => {
    const fetchMakes = async () => {
      const makesData = await getMakes();
      setMakes(makesData);
    };
    fetchMakes();
  }, []);
  
  useEffect(() => {
    const fetchModels = async () => {
      if (selectedMake) {
        const modelsData = await getModelsByMake(selectedMake);
        setModels(modelsData);
      } else {
        setModels([]);
      }
    };
    fetchModels();
    setValue('model', '');
  }, [selectedMake, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      onFilterChange(value as Filters);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFilterChange]);

  const handleReset = () => {
    reset(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const currentPriceRange = watch('priceRange') || defaultFilters.priceRange;
  const currentMileageRange = watch('mileageRange') || defaultFilters.mileageRange;
  const currentYearRange = watch('yearRange') || defaultFilters.yearRange;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Rechercher un véhicule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Marque</Label>
            <Controller
              name="make"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value === 'all' ? '' : value)} value={field.value || 'all'}>
                  <SelectTrigger><SelectValue placeholder="Toutes les marques" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les marques</SelectItem>
                    {makes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Modèle</Label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value === 'all' ? '' : value)} value={field.value || 'all'} disabled={!selectedMake || models.length === 0}>
                  <SelectTrigger><SelectValue placeholder="Tous les modèles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modèles</SelectItem>
                    {models.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Type de carburant</Label>
            <Controller
              name="fuelType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value === 'all' ? '' : value)} value={field.value || 'all'}>
                  <SelectTrigger><SelectValue placeholder="Tous types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    {FUEL_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Canton</Label>
            <Controller
              name="canton"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value === 'all' ? '' : value)} value={field.value || 'all'}>
                  <SelectTrigger><SelectValue placeholder="Toute la Suisse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toute la Suisse</SelectItem>
                    {CANTONS.map(canton => <SelectItem key={canton.value} value={canton.value}>{canton.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="flex items-center gap-2 text-primary">
                <SlidersHorizontal size={16} />
                Filtres additionnels
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label>Fourchette de prix</Label>
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

                <div className="space-y-2">
                  <Label>Kilométrage</Label>
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
                
                <div className="space-y-2">
                  <Label>Année</Label>
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
                  <Label>Boîte de vitesses</Label>
                  <Controller
                    name="gearbox"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(value) => field.onChange(value === 'all' ? '' : value)} value={field.value || 'all'}>
                        <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {GEARBOX_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                
                <div className="col-span-1 md:col-span-3">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
