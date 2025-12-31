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
import { deleteDoc, doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Vehicle } from '@/lib/types';


interface DeleteListingButtonProps {
  vehicleId: string;
  onDeletionSuccess?: (vehicleId: string) => void;
}

const deletionReasons = [
    { id: "sold-on-tacoto", label: "Vendu grâce à Tacoto.ch" },
    { id: "sold-elsewhere", label: "Vendu sur une autre plateforme" },
    { id: "no-longer-selling", label: "Je ne vends plus le véhicule" },
    { id: "incorrect-listing", label: "Annonce incorrecte ou doublon" },
    { id: "other", label: "Autre" },
];

export default function DeleteListingButton({ vehicleId, onDeletionSuccess }: DeleteListingButtonProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isSubmissionDisabled = !reason || (reason === 'other' && !otherReason.trim());

  const handleDelete = async () => {
    if (isSubmissionDisabled) {
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
    const deletedVehicleCollectionRef = collection(firestore, 'deleted-vehicles');

    try {
      // 1. Get the vehicle data before deleting
      const vehicleSnap = await getDoc(vehicleDocRef);
      if (!vehicleSnap.exists()) {
        throw new Error("L'annonce n'existe pas.");
      }
      const vehicleData = vehicleSnap.data() as Vehicle;

      // 2. Archive the vehicle data with the deletion reason
      const finalReason = reason === 'other' ? otherReason : deletionReasons.find(r => r.id === reason)?.label;
      
      await setDoc(doc(deletedVehicleCollectionRef, vehicleId), {
          ...vehicleData,
          deletionReason: finalReason,
          deletedAt: serverTimestamp(),
      });

      // 3. Delete the original document
      await deleteDoc(vehicleDocRef);
      
      toast({
        title: 'Annonce supprimée',
        description: 'Votre annonce a été retirée de la plateforme.',
      });
      
      onDeletionSuccess?.(vehicleId);
      setIsOpen(false);
      setReason('');
      setOtherReason('');

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
            Cette action est irréversible. L'annonce sera archivée pour nos statistiques.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
            <Label htmlFor="delete-reason">Pourquoi supprimez-vous cette annonce ?</Label>
            <RadioGroup
                value={reason}
                onValueChange={setReason}
                className="space-y-2"
            >
                {deletionReasons.map((r) => (
                     <div key={r.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={r.id} id={r.id} />
                        <Label htmlFor={r.id} className="font-normal">{r.label}</Label>
                    </div>
                ))}
            </RadioGroup>

            {reason === 'other' && (
                <div className="pt-2">
                     <Label htmlFor="other-reason">Veuillez préciser :</Label>
                     <Textarea 
                        id="other-reason"
                        placeholder="Raison..."
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="mt-2"
                    />
                </div>
            )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isSubmissionDisabled || isDeleting}>
            {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
