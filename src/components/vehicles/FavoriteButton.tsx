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
  const { firestore } = useFirebase();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user || !firestore) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const favDocRef = doc(firestore, 'users', user.uid, 'favorites', vehicleId);
    const unsubscribe = onSnapshot(favDocRef, (doc) => {
      setIsFavorite(doc.exists());
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [user, userLoading, firestore, vehicleId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if the button is inside a Link
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

  if (userLoading) {
    // Show a disabled button while user state is loading
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm"
        disabled={true}
        aria-label="Chargement des favoris"
      >
        <Heart className="text-gray-300" />
      </Button>
    );
  }

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm"
      onClick={toggleFavorite}
      disabled={loading}
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
