'use client';
import { notFound, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Cog, Fuel, Gauge, CheckCircle, User, Building, MapPin, Globe, Car, Users, Settings, Palette, CigaretteOff, Check } from 'lucide-react';
import ImageGallery from '@/components/vehicles/ImageGallery';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import type { Vehicle, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot, getDoc, getFirestore, initializeApp, getApps, getApp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProtectedContactButtons from '@/components/vehicles/ProtectedContactButtons';
import { useUser } from '@/firebase/auth/use-user';
import FavoriteButton from '@/components/vehicles/FavoriteButton';
import { firebaseConfig } from '@/firebase/config';
import type { Metadata } from 'next';

// This function runs on the server to generate metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  try {
    // Initialize a temporary server-side instance of Firebase to fetch data
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const vehicleDocRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(vehicleDocRef);

    if (docSnap.exists()) {
      const vehicle = docSnap.data() as Vehicle;
      const title = `${vehicle.make} ${vehicle.model} de ${vehicle.year} - ${formatCurrency(vehicle.price)}`;
      const description = `Découvrez cette ${vehicle.make} ${vehicle.model} à ${vehicle.canton}. ${vehicle.mileage.toLocaleString('fr-CH')} km, ${vehicle.gearbox}. ${vehicle.description.substring(0, 120)}...`;
      const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : undefined;

      return {
        title: title,
        description: description,
        openGraph: {
          title: title,
          description: description,
          images: imageUrl ? [imageUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  // Return default metadata if vehicle not found or on error
  return {
    title: "Annonce non trouvée",
    description: "Cette annonce n'est plus disponible.",
  };
}


export default function VehiclePage() {
  const { firestore } = useFirebase();
  const params = useParams();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    if (!id || !firestore) return;

    setLoading(true);
    const vehicleDocRef = doc(firestore, 'vehicles', id);
    const unsubscribeVehicle = onSnapshot(vehicleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const vehicleData = { id: docSnap.id, ...docSnap.data() } as Vehicle;
        setVehicle(vehicleData);

        if (vehicleData.userId) {
          const sellerDocRef = doc(firestore, 'users', vehicleData.userId);
          const unsubscribeSeller = onSnapshot(sellerDocRef, (sellerDocSnap) => {
            if (sellerDocSnap.exists()) {
              setSeller(sellerDocSnap.data() as UserProfile);
            } else {
              setSeller(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Error fetching seller profile:", error);
            setSeller(null);
            setLoading(false);
          });
          
          return () => unsubscribeSeller();
        } else {
          setLoading(false);
        }
      } else {
        notFound();
      }
    }, (error) => {
      console.error("Error fetching vehicle:", error);
      notFound();
    });

    return () => unsubscribeVehicle();
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

  const mainSpecs = [
    { icon: Calendar, label: 'Année', value: vehicle.year },
    { icon: Gauge, label: 'Kilométrage', value: `${vehicle.mileage.toLocaleString('fr-CH')} km` },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuelType },
    { icon: Cog, label: 'Boîte', value: vehicle.gearbox },
  ];
  
  const secondarySpecs = [
    { icon: Car, label: 'Portes', value: vehicle.doors },
    { icon: Users, label: 'Places', value: vehicle.seats },
    { icon: Settings, label: 'Traction', value: vehicle.drive },
    { icon: Gauge, label: 'Puissance', value: `${vehicle.power} ${vehicle.powerUnit}` },
    { icon: Palette, label: 'Extérieur', value: vehicle.exteriorColor },
    { icon: Palette, label: 'Intérieur', value: vehicle.interiorColor },
    { icon: Check, label: 'État', value: vehicle.condition },
  ];
  
  const mailSubject = encodeURIComponent(`Intérêt pour votre ${vehicle.make} ${vehicle.model} sur Tacoto.ch`);
  const mailtoLink = `mailto:${seller?.email}?subject=${mailSubject}`;

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
              <div className="flex items-center justify-between">
                <Badge className="w-fit mb-2" variant="secondary">{vehicle.canton}</Badge>
                 {currentUser && (
                  <FavoriteButton vehicleId={vehicle.id} />
                )}
              </div>
              <h1 className="text-3xl font-bold">{vehicle.make} {vehicle.model}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">{formatCurrency(vehicle.price)}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                {mainSpecs.map(spec => (
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
                      {seller.userType === 'professionnel' ? (
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
                     
                      {vehicle.userId !== currentUser?.uid && (
                        <ProtectedContactButtons seller={seller} vehicle={vehicle} />
                      )}
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
          
          <div className="p-6 border-t space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.description}</p>
            </div>

            <Separator />
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {secondarySpecs.map(spec => (
                  spec.value && <div key={spec.label} className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
                    <spec.icon className="text-primary" size={18} />
                    <div>
                      <p className="text-muted-foreground">{spec.label}</p>
                      <p className="font-semibold text-foreground">{spec.value}</p>
                    </div>
                  </div>
                ))}
                 {vehicle.nonSmoker && (
                  <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
                    <CigaretteOff className="text-primary" size={18} />
                    <div>
                      <p className="text-muted-foreground">Non-fumeur</p>
                      <p className="font-semibold text-foreground">Oui</p>
                    </div>
                  </div>
                 )}
              </div>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
                <>
                <Separator />
                <div>
                    <h2 className="text-xl font-semibold mb-4">Équipements</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                    {vehicle.features.map(feature => (
                        <li key={feature} className="flex items-center gap-3 py-1">
                        <CheckCircle className="text-green-500" size={18} />
                        <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                    </ul>
                </div>
                </>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
