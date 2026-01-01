'use client';

import { useState } from 'react';
import type { Vehicle } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import Image from 'next/image';
import { ImageIcon, X, Heart, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface SwipeCardProps {
  vehicle: Vehicle;
  onSwipe: () => void;
}

export default function SwipeCard({ vehicle, onSwipe }: SwipeCardProps) {
  const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  
  const handleLike = async () => {
    if (!user || !firestore) return;
    const favDocRef = doc(firestore, 'users', user.uid, 'favorites', vehicle.id);
    try {
        await setDoc(favDocRef, { 
            vehicleId: vehicle.id,
            createdAt: serverTimestamp() 
        });
        toast({ title: 'Ajouté aux favoris !' });
    } catch (error) {
        console.error("Error liking vehicle:", error);
    }
    onSwipe();
  };

  const handleDislike = () => {
    onSwipe();
  };

  return (
    <Card className="w-full max-w-sm h-[600px] flex flex-col shadow-2xl rounded-2xl overflow-hidden relative">
      <CardHeader className="p-0 relative flex-grow">
         <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="text-lg py-1 px-3">{formatCurrency(vehicle.price)}</Badge>
         </div>
         <div className="absolute top-4 right-4 z-10">
            <Button asChild variant="ghost" size="icon" className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white">
                <Link href={`/vehicles/${vehicle.id}`} target="_blank">
                    <Info />
                </Link>
            </Button>
         </div>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
            data-ai-hint="car exterior"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <ImageIcon className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 bg-background z-10">
        <h2 className="text-2xl font-bold truncate">{vehicle.make} {vehicle.model}</h2>
        <div className="flex items-center gap-4 text-muted-foreground mt-1">
            <span>{vehicle.year}</span>
            <span>{vehicle.mileage.toLocaleString('fr-CH')} km</span>
            <span>{vehicle.gearbox}</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 flex justify-center gap-6 bg-background z-10">
        <Button 
            variant="outline" 
            size="icon" 
            className="h-20 w-20 rounded-full border-4 border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleDislike}
        >
          <X size={40} />
        </Button>
        <Button 
            variant="outline" 
            size="icon" 
            className="h-20 w-20 rounded-full border-4 border-green-500 text-green-500 hover:bg-green-500/10"
            onClick={handleLike}
        >
          <Heart size={40} />
        </Button>
      </CardFooter>
    </Card>
  );
}
