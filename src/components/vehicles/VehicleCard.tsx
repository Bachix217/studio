
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
      <Badge variant="secondary" className="border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400 backdrop-blur-sm">
        <CheckCircle className="mr-1 h-3 w-3" />
        Publiée
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 backdrop-blur-sm">
        <Clock className="mr-1 h-3 w-3" />
        En attente
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-600/30 backdrop-blur-sm">
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
  const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;

  return (
    <Card className="group h-full flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-none rounded-lg">
       <div className="relative">
        <div className="absolute top-3 left-3 z-10">
          {showControls ? (
            <StatusBadge status={vehicle.status} published={vehicle.published} />
          ) : (
            <Badge className="bg-blue-50 text-blue-700 text-sm font-bold py-1 px-3 shadow-md border border-blue-200/50">
              {formatCurrency(vehicle.price)}
            </Badge>
          )}
        </div>
        {!showControls && (
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton vehicleId={vehicle.id} />
          </div>
        )}
        <Link href={`/vehicles/${vehicle.id}`} className="block">
            <CardHeader className="p-0 relative">
              <div className="aspect-[4/3] relative w-full overflow-hidden bg-muted rounded-t-lg">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      className={cn("object-cover transition-transform duration-300 group-hover:scale-105", !vehicle.published && "grayscale opacity-75")}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      data-ai-hint="car exterior"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                 <div className="absolute bottom-3 left-3 z-10">
                    <Badge className="border-white/20 bg-black/30 text-white backdrop-blur-sm shadow-md">{vehicle.canton}</Badge>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-2">
              <CardTitle className="text-lg font-bold leading-tight truncate">
                {vehicle.make} {vehicle.model} {vehicle.trim}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{vehicle.year}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge size={12} />
                  <span>{vehicle.mileage.toLocaleString('fr-CH')} km</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cog size={12} />
                  <span>{vehicle.gearbox}</span>
                </div>
              </div>
            </CardContent>
        </Link>
      </div>

       {showControls && (
          <CardFooter className="p-4 pt-2 mt-auto border-t flex items-center justify-between bg-muted/30">
            <div className="font-bold text-primary">{formatCurrency(vehicle.price)}</div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/edit-listing/${vehicle.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                    </Link>
                </Button>
                <DeleteListingButton vehicleId={vehicle.id} onDeletionSuccess={onDeletionSuccess} />
            </div>
          </CardFooter>
      )}

      {!showControls && (
        <div className="mt-auto p-4 pt-0">
             <Button asChild variant="outline" className="w-full">
                <Link href={`/vehicles/${vehicle.id}`}>Voir les détails</Link>
            </Button>
        </div>
      )}
    </Card>
  );
}
