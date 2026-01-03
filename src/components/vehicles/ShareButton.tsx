'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  vehicle: Vehicle;
}

export default function ShareButton({ vehicle }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `Regarde cette ${vehicle.make} ${vehicle.model} à ${formatCurrency(vehicle.price)} sur Tacoto.ch !`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tacoto.ch - ${vehicle.make} ${vehicle.model}`,
          text: shareText,
          url: url,
        });
      } catch (error) {
        // L'utilisateur a peut-être annulé le partage, pas besoin d'afficher d'erreur.
        console.log('Share action was cancelled or failed', error);
      }
    } else {
      // Fallback pour les navigateurs de bureau
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Lien copié !',
          description: 'Le lien de l\'annonce a été copié dans le presse-papiers.',
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de copier le lien.',
        });
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm text-gray-600"
      onClick={handleShare}
      aria-label="Partager l'annonce"
    >
      <Share2 />
    </Button>
  );
}
