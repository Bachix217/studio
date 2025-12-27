'use client';
import { getVehicleById } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Cog, Fuel, Gauge, Mail, MessageCircle, CheckCircle, User, Globe, Building, MapPin } from 'lucide-react';
import ImageGallery from '@/components/vehicles/ImageGallery';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import type { Vehicle, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VehiclePage() {
  const { firestore } = useFirebase();
  const params = useParams();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && firestore) {
      getVehicleById(firestore, id).then(async vehicleData => {
        if (vehicleData) {
          setVehicle(vehicleData);
          if (vehicleData.userId) {
            const sellerDocRef = doc(firestore, 'users', vehicleData.userId);
            const sellerDocSnap = await getDoc(sellerDocRef);
            if (sellerDocSnap.exists()) {
              setSeller(sellerDocSnap.data() as UserProfile);
            }
          }
        } else {
          notFound();
        }
        setLoading(false);
      });
    }
  }, [id, firestore]);

  if (loading || !vehicle) {
     return (
      <>
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3">
                 <Skeleton className="aspect-[4/3] w-full h-full" />
              </div>
              <div className="lg:col-span-2 p-6 flex flex-col gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <Skeleton className="h-8 w-8 rounded-full" />
                       <div className="flex flex-col gap-2">
                         <Skeleton className="h-5 w-20" />
                         <Skeleton className="h-4 w-12" />
                       </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
               <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
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
                {seller ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations du vendeur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {seller.userType === 'professionnel' && seller.companyName ? (
                        <>
                           <div className="flex items-start gap-3">
                            <Building className="text-muted-foreground mt-1" size={18} />
                            <div>
                              <p className="font-semibold">{seller.companyName}</p>
                              <p className="text-sm text-muted-foreground">{seller.displayName}</p>
                            </div>
                          </div>
                           {seller.address && (
                            <div className="flex items-start gap-3">
                              <MapPin className="text-muted-foreground mt-1" size={18} />
                              <p className="text-sm">{seller.address}</p>
                            </div>
                           )}
                           {seller.website && (
                             <div className="flex items-start gap-3">
                               <Globe className="text-muted-foreground mt-1" size={18} />
                               <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {seller.website}
                               </a>
                            </div>
                           )}
                        </>
                      ) : (
                         <div className="flex items-center gap-3">
                          <User className="text-muted-foreground" size={18} />
                          <p className="font-semibold">{seller.displayName}</p>
                        </div>
                      )}
                     
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                       {seller.sharePhoneNumber && seller.phone && (
                        <Button asChild className="w-full" size="lg">
                          <a href={`https://wa.me/${seller.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2" /> WhatsApp
                          </a>
                        </Button>
                      )}
                      <Button asChild className="w-full" variant="outline" size="lg" disabled={!seller.email}>
                         <a href={`mailto:${seller.email}`}>
                          <Mail className="mr-2" /> E-mail
                        </a>
                      </Button>
                    </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Informations du vendeur non disponibles.</p>
                  </div>
                )}
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
