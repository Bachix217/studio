'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleList from '@/components/vehicles/VehicleList';
import { useUser } from '@/firebase/auth/use-user';
import { useFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyListingsPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) return;

    setLoading(true);
    const vehiclesCollection = collection(firestore, 'vehicles');
    const q = query(
      vehiclesCollection,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      setVehicles(userVehicles);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user's vehicles: ", error);
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
            <h1 className="text-3xl font-bold tracking-tight">Mes annonces</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Mes annonces</h1>
          <Button asChild>
            <Link href="/sell">Vendre une voiture</Link>
          </Button>
        </div>
        {vehicles.length > 0 ? (
          <VehicleList vehicles={vehicles} />
        ) : (
          <div className="text-center py-16 bg-card rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">Vous n'avez aucune annonce active.</h2>
            <p className="text-muted-foreground mt-2">Commencez par vendre votre première voiture !</p>
            <Button asChild className="mt-4">
              <Link href="/sell">Créer une annonce</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
