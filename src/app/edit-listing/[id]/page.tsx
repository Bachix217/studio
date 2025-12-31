'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/sell/SellForm';
import { useUser } from '@/firebase/auth/use-user';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound, useParams, useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditListingPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore || !id) return;

    const fetchVehicle = async () => {
      try {
        const vehicleDocRef = doc(firestore, 'vehicles', id);
        const docSnap = await getDoc(vehicleDocRef);

        if (docSnap.exists()) {
          const vehicleData = { id: docSnap.id, ...docSnap.data() } as Vehicle;
          // Security check: ensure the current user owns this vehicle
          if (vehicleData.userId !== user.uid) {
            setError('Vous n\'êtes pas autorisé à modifier cette annonce.');
          } else {
            setVehicle(vehicleData);
          }
        } else {
          notFound();
        }
      } catch (e) {
        console.error("Error fetching vehicle for edit:", e);
        setError("Une erreur est survenue lors du chargement de l'annonce.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();

  }, [user, userLoading, firestore, router, id]);

  if (loading || userLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                 <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-[500px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
     return null; // Redirecting
  }

  if (error) {
     return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Accès refusé</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/my-listings">Retour à mes annonces</Link>
            </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    // This can happen briefly or if notFound() was triggered.
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Modifier votre annonce</h1>
            <p className="mt-2 text-lg text-muted-foreground">Mettez à jour les informations de votre {vehicle.make} {vehicle.model}.</p>
          </div>
          <SellForm vehicleToEdit={vehicle} />
        </div>
      </main>
      <Footer />
    </>
  );
}
