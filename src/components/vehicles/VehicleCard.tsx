import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Cog, Fuel, Gauge, MapPin } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint="car exterior"
            />
          </div>
          <Badge className="absolute top-3 right-3" variant="secondary">{vehicle.canton}</Badge>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
          <CardTitle className="text-lg font-bold leading-tight truncate">
            {vehicle.make} {vehicle.model}
          </CardTitle>
          <p className="text-xl font-semibold text-primary">{formatCurrency(vehicle.price)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge size={16} />
              <span>{vehicle.mileage.toLocaleString('fr-CH')} km</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel size={16} />
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cog size={16} />
              <span>{vehicle.gearbox}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Badge variant="outline" className="w-full justify-center">Voir les détails</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
