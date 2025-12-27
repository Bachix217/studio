import type { Vehicle } from '@/lib/types';
import VehicleCard from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg p-8 text-center shadow-sm">
        <h3 className="text-xl font-semibold">Aucun résultat trouvé</h3>
        <p className="text-muted-foreground mt-2">Essayez d'ajuster vos filtres de recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
