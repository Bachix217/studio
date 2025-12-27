'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFirebase } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface DeleteListingButtonProps {
  vehicleId: string;
}

export default function DeleteListingButton({ vehicleId }: DeleteListingButtonProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Raison requise',
        description: 'Veuillez indiquer la raison de la suppression.',
      });
      return;
    }
    
    if (!firestore || !vehicleId) return;

    setIsDeleting(true);
    const vehicleDocRef = doc(firestore, 'vehicles', vehicleId);

    try {
      await deleteDoc(vehicleDocRef);
      // Here you could save the reason to another collection for analytics
      // For example: await addDoc(collection(firestore, 'deletion-reasons'), { vehicleId, reason, deletedAt: serverTimestamp() });
      toast({
        title: 'Annonce supprimée',
        description: 'Votre annonce a été retirée de la plateforme.',
      });
      setIsOpen(false);
      setReason('');
    } catch (error: any) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer l\'annonce. ' + error.message,
      });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette annonce ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Pour nous aider à nous améliorer, veuillez indiquer la raison de la suppression.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="delete-reason">Raison de la suppression</Label>
            <Textarea 
                id="delete-reason"
                placeholder="Ex: Vendu grâce à Tacoto.ch, vendu ailleurs, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={!reason.trim() || isDeleting}>
            {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
