'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { collection, onSnapshot, query, orderBy, doc, getDocs } from 'firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function CatchCarClient() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);

    const vehiclesQuery = query(collection(firestore, 'vehicles'), orderBy('createdAt', 'desc'));
    const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      setAllVehicles(vehiclesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vehicles: ", error);
      setLoading(false);
    });

    let unsubscribeFavorites = () => {};
    if (user) {
        const favoritesQuery = query(collection(firestore, 'users', user.uid, 'favorites'));
        unsubscribeFavorites = onSnapshot(favoritesQuery, (snapshot) => {
            const favIds = new Set(snapshot.docs.map(doc => doc.id));
            setFavoriteIds(favIds);
        });
    }


    return () => {
      unsubscribeVehicles();
      unsubscribeFavorites();
    };
  }, [firestore, user]);

  const vehiclesToSwipe = useMemo(() => {
    // Show vehicles that are not in favorites
    return allVehicles.filter(v => !favoriteIds.has(v.id));
  }, [allVehicles, favoriteIds]);

  const handleSwipe = () => {
    setCurrentIndex(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (vehiclesToSwipe.length === 0) {
      return (
         <div className="text-center py-16 px-6 bg-card rounded-lg shadow-sm max-w-lg w-full">
            <h2 className="text-2xl font-semibold">C'est tout pour aujourd'hui !</h2>
            <p className="text-muted-foreground mt-2">Vous avez vu toutes les voitures disponibles. Revenez plus tard pour de nouvelles annonces ou consultez vos favoris.</p>
            <Button asChild className="mt-6">
              <Link href="/my-favorites">Voir mes favoris</Link>
            </Button>
          </div>
      )
  }

  if (currentIndex >= vehiclesToSwipe.length) {
     return (
        <div className="text-center py-16 px-6 bg-card rounded-lg shadow-sm max-w-lg w-full">
            <h2 className="text-2xl font-semibold">Fin de la sélection</h2>
            <p className="text-muted-foreground mt-2">Vous avez parcouru toutes les voitures correspondant à vos critères actuels.</p>
            <Button asChild className="mt-6">
                <Link href="/my-favorites">Revoir mes favoris</Link>
            </Button>
             <Button variant="outline" onClick={() => setCurrentIndex(0)} className="mt-2 ml-2">
                Recommencer
            </Button>
        </div>
    );
  }

  const currentVehicle = vehiclesToSwipe[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm">
        <SwipeCard 
            key={currentVehicle.id}
            vehicle={currentVehicle}
            onSwipe={handleSwipe}
        />
        <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {vehiclesToSwipe.length}
        </p>
    </div>
  );
}
