'use client';

import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import type { Vehicle } from '@/lib/types';
import Image from 'next/image';
import { ImageIcon, Info, Calendar, Gauge } from 'lucide-react';
import { Button } from '../ui/button';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface SwipeCardProps {
  vehicle: Vehicle;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ vehicle, onSwipe }: SwipeCardProps) {
  const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  const x = useMotionValue(0);
  const controls = useAnimation();

  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const catchOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleLike();
    } else if (info.offset.x < -100) {
      handleDislike();
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleLike = async () => {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Action requise',
            description: 'Connectez-vous pour ajouter un favori.',
        });
        return;
    }
    const favDocRef = doc(firestore, 'users', user.uid, 'favorites', vehicle.id);
    try {
      await setDoc(favDocRef, { 
        vehicleId: vehicle.id,
        createdAt: serverTimestamp() 
      });
      toast({ title: 'Catch !', description: `${vehicle.make} ${vehicle.model} ajouté aux favoris.` });
    } catch (error) {
      console.error("Error liking vehicle:", error);
    }
    onSwipe('right');
  };

  const handleDislike = () => {
    onSwipe('left');
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      onDragEnd={handleDragEnd}
      animate={controls}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full max-w-sm h-[600px] rounded-2xl shadow-2xl overflow-hidden relative cursor-grab active:cursor-grabbing"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
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
      </div>

      {/* Swipe Indicators */}
      <motion.div
        style={{ opacity: catchOpacity }}
        className="absolute top-12 left-8 -rotate-[15deg] border-4 border-green-400 text-green-400 text-5xl font-black uppercase px-6 py-2 rounded-xl"
      >
        Catch
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-12 right-8 rotate-[15deg] border-4 border-red-500 text-red-500 text-5xl font-black uppercase px-6 py-2 rounded-xl"
      >
        Pass
      </motion.div>

      {/* Gradient and Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        
        <div className="absolute top-6 right-6 pointer-events-auto">
            <Button asChild variant="ghost" size="icon" className="rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white">
                <Link href={`/vehicles/${vehicle.id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                    <Info />
                </Link>
            </Button>
        </div>
        
        <h2 className="text-3xl font-bold">{formatCurrency(vehicle.price)}</h2>
        <p className="text-2xl font-light leading-tight">{vehicle.make} {vehicle.model}</p>
        <p className="text-lg text-white/70">{vehicle.trim}</p>
        
        <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="backdrop-blur-md bg-white/10 border-white/20 text-white flex items-center gap-2">
                <Calendar size={14} /> {vehicle.year}
            </Badge>
             <Badge variant="secondary" className="backdrop-blur-md bg-white/10 border-white/20 text-white flex items-center gap-2">
                <Gauge size={14} /> {vehicle.mileage.toLocaleString('fr-CH')} km
            </Badge>
        </div>
      </div>
    </motion.div>
  );
}