'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  vehicleId: string;
}

export default function FavoriteButton({ vehicleId }: FavoriteButtonProps) {
  const { firestore, loading: firebaseLoading } = useFirebase();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Overall loading state: Firebase isn't ready OR user isn't loaded OR we haven't checked the favorite status yet.
  const isLoading = firebaseLoading || userLoading || !isSubscribed;

  useEffect(() => {
    if (firebaseLoading || userLoading || !user || !firestore) {
      if (!user) {
        setIsSubscribed(true); // No user, so no subscription needed. We're "ready" to show nothing.
      }
      return;
    }

    const favDocRef = doc(firestore, 'users', user.uid, 'favorites', vehicleId);
    const unsubscribe = onSnapshot(favDocRef, (doc) => {
      setIsFavorite(doc.exists());
      setIsSubscribed(true); // Mark that we have received the first snapshot
    }, (error) => {
        console.error("Error subscribing to favorite status:", error);
        setIsSubscribed(true); // Mark as subscribed even on error to unblock UI
    });

    return () => unsubscribe();
  }, [user, userLoading, firestore, vehicleId, firebaseLoading]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour gérer vos favoris.',
      });
      return;
    }

    const favDocRef = doc(firestore, 'users', user.uid, 'favorites', vehicleId);

    try {
      if (isFavorite) {
        await deleteDoc(favDocRef);
        toast({ title: 'Retiré des favoris' });
      } else {
        await setDoc(favDocRef, { 
          vehicleId: vehicleId,
          createdAt: serverTimestamp() 
        });
        toast({ title: 'Ajouté aux favoris' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue.',
      });
    }
  };
  
  if (!user && !userLoading && !firebaseLoading) {
    return null; // Don't show the button if the user is not logged in
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label="Ajouter aux favoris"
    >
      <Heart
        className={cn('transition-all', {
          'text-red-500 fill-red-500': isFavorite,
          'text-gray-500': !isFavorite,
        })}
      />
    </Button>
  );
}
