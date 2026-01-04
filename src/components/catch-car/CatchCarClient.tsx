'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function CatchCarClient() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    setLoading(true);

    const vehiclesQuery = query(
      collection(firestore, 'vehicles'),
      where('published', '==', true),
      where('status', '==', 'approved')
    );
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
    // Filter out user's own listings, already favorited, and already viewed in this session
    return allVehicles.filter(v => 
        v.userId !== user?.uid && 
        !favoriteIds.has(v.id) &&
        !viewedIds.has(v.id)
    );
  }, [allVehicles, favoriteIds, viewedIds, user]);

  const handleSwipe = useCallback((vehicleId: string) => {
    setViewedIds(prev => new Set(prev).add(vehicleId));
  }, []);

  const resetSwipes = () => {
    setViewedIds(new Set());
  }

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
        <h2 className="text-2xl font-semibold">C'est tout pour le moment !</h2>
        <p className="text-muted-foreground mt-2">Vous avez vu toutes les voitures disponibles. Revenez plus tard pour de nouvelles annonces ou consultez vos favoris.</p>
        <div className="flex gap-2 justify-center mt-6">
            <Button asChild>
              <Link href="/my-favorites">Voir mes favoris</Link>
            </Button>
             <Button variant="outline" onClick={resetSwipes}>
                Recommencer
            </Button>
        </div>
      </div>
    );
  }

  const currentVehicle = vehiclesToSwipe[0];

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm h-[650px]">
        {currentVehicle && 
            <SwipeCard 
                key={currentVehicle.id}
                vehicle={currentVehicle}
                onSwipe={() => handleSwipe(currentVehicle.id)}
            />
        }
        <p className="text-sm text-muted-foreground">
            {viewedIds.size + 1} / {allVehicles.filter(v => v.userId !== user?.uid).length}
        </p>
    </div>
  );
}