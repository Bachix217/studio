import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Cog, Fuel, Gauge, MapPin, ImageIcon, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';
import DeleteListingButton from './DeleteListingButton';
import { Button } from '../ui/button';
import FavoriteButton from './FavoriteButton';
import { useUser } from '@/firebase/auth/use-user';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  showControls?: boolean;
  onDeletionSuccess?: (vehicleId: string) => void;
}

const StatusBadge = ({ status, published }: { status: Vehicle['status'], published: Vehicle['published'] }) => {
  if (status === 'approved' && published) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Publiée
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
        <Clock className="mr-1 h-3 w-3" />
        En attente
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Rejetée
      </Badge>
    );
  }
   if (status === 'approved' && !published) {
    return (
      <Badge variant="secondary">
        Approuvée (non publiée)
      </Badge>
    );
  }
  return null;
};


export default function VehicleCard({ vehicle, showControls = false, onDeletionSuccess }: VehicleCardProps) {
  const { user } = useUser();
  const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 group">
       <div className="relative">
         {user && !showControls && ( // Show favorite on public pages only
          <div className="absolute top-2 left-2 z-10">
            <FavoriteButton vehicleId={vehicle.id} />
          </div>
        )}
        {showControls && (
             <div className="absolute top-2 left-2 z-10">
                <StatusBadge status={vehicle.status} published={vehicle.published} />
             </div>
        )}
        <Link href={`/vehicles/${vehicle.id}`} className="block">
            <CardHeader className="p-0 relative">
              <div className="aspect-[4/3] relative w-full overflow-hidden bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className={cn("object-cover transition-transform duration-300 group-hover:scale-105", !vehicle.published && "grayscale opacity-75")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    data-ai-hint="car exterior"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
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
        </Link>
      </div>

       {showControls && (
          <CardFooter className="p-4 pt-2 mt-auto border-t flex items-center justify-between">
              <Button asChild variant="outline" size="sm">
                <Link href={`/edit-listing/${vehicle.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
              <DeleteListingButton vehicleId={vehicle.id} onDeletionSuccess={onDeletionSuccess} />
          </CardFooter>
      )}

      {!showControls && (
        <Link href={`/vehicles/${vehicle.id}`} className="block mt-auto">
            <CardFooter className="p-4 pt-0">
                <Badge variant="outline" className="w-full justify-center">Voir les détails</Badge>
            </CardFooter>
        </Link>
      )}
    </Card>
  );
}
