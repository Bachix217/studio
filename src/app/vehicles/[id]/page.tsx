import { getVehicleById, getVehicles } from '@/lib/data';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Cog, Fuel, Gauge, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import ImageGallery from '@/components/vehicles/ImageGallery';

export async function generateStaticParams() {
  const vehicles = await getVehicles();
  return vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) {
    return { title: 'Véhicule non trouvé' };
  }
  return {
    title: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - Tacoto.ch`,
    description: vehicle.description.substring(0, 150),
  };
}


export default async function VehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  const specs = [
    { icon: Calendar, label: 'Année', value: vehicle.year },
    { icon: Gauge, label: 'Kilométrage', value: `${vehicle.mileage.toLocaleString('fr-CH')} km` },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuelType },
    { icon: Cog, label: 'Boîte', value: vehicle.gearbox },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3">
              <ImageGallery images={vehicle.images} alt={`${vehicle.make} ${vehicle.model}`} />
            </div>

            <div className="lg:col-span-2 p-6 flex flex-col">
              <Badge className="w-fit mb-2" variant="secondary">{vehicle.canton}</Badge>
              <h1 className="text-3xl font-bold">{vehicle.make} {vehicle.model}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">{formatCurrency(vehicle.price)}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                {specs.map(spec => (
                  <div key={spec.label} className="flex items-center gap-2 text-muted-foreground">
                    <spec.icon className="text-primary" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">{spec.value}</p>
                      <p>{spec.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-8">
                <p className="font-semibold mb-2">Contacter le vendeur :</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="w-full" size="lg">
                    <MessageCircle className="mr-2" /> WhatsApp
                  </Button>
                  <Button className="w-full" variant="outline" size="lg">
                    <Mail className="mr-2" /> E-mail
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.description}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Équipements</h2>
                <ul className="space-y-2">
                  {vehicle.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="text-green-500" size={18} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
