'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleList from '@/components/vehicles/VehicleList';
import { useUser } from '@/firebase/auth/use-user';
import { useFirebase } from '@/firebase';
import { collection, query, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Vehicle, Favorite } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';

export default function MyFavoritesPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) return;

    setLoading(true);
    const favoritesCollectionRef = collection(firestore, 'users', user.uid, 'favorites');
    const q = query(favoritesCollectionRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const favoriteIds = snapshot.docs.map(doc => doc.id);
      
      if (favoriteIds.length === 0) {
        setFavoriteVehicles([]);
        setLoading(false);
        return;
      }
      
      try {
        const vehiclePromises = favoriteIds.map(id => getDoc(doc(firestore, 'vehicles', id)));
        const vehicleDocs = await Promise.all(vehiclePromises);
        
        const vehicles = vehicleDocs
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Vehicle));
          
        setFavoriteVehicles(vehicles);
      } catch (error) {
         console.error("Error fetching favorite vehicles: ", error);
      } finally {
         setLoading(false);
      }

    }, (error) => {
      console.error("Error fetching user's favorites: ", error);
      setLoading(false);
    });

    return () => unsubscribe();

  }, [user, userLoading, firestore, router]);
  
  if (userLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Mes favoris</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting...
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mes favoris</h1>
        </div>
        {favoriteVehicles.length > 0 ? (
          <VehicleList vehicles={favoriteVehicles} />
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-sm">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold mt-4">Vous n'avez aucun favori.</h2>
            <p className="text-muted-foreground mt-2">Cliquez sur le cœur d'une annonce pour l'ajouter ici.</p>
            <Button asChild className="mt-4">
              <Link href="/">Parcourir les véhicules</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
