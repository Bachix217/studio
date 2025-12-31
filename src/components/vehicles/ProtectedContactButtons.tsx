'use client';

import { useUser } from "@/firebase/auth/use-user";
import type { UserProfile, Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageCircle, Phone, ShieldAlert, LogIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface ProtectedContactButtonsProps {
    seller: UserProfile;
    vehicle: Vehicle;
}

export default function ProtectedContactButtons({ seller, vehicle }: ProtectedContactButtonsProps) {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="pt-2">
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <Alert>
                <LogIn className="h-4 w-4" />
                <AlertTitle>Connectez-vous pour contacter</AlertTitle>
                <AlertDescription>
                    <Button asChild variant="link" className="p-0 h-auto font-semibold">
                         <Link href="/login">Connectez-vous</Link>
                    </Button>
                    {' '}ou{' '}
                    <Button asChild variant="link" className="p-0 h-auto font-semibold">
                        <Link href="/signup">créez un compte</Link>
                    </Button>
                    {' '}pour voir les informations du vendeur.
                </AlertDescription>
            </Alert>
        );
    }
    
    if (!user.phoneNumber) {
        return (
             <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Vérification requise</AlertTitle>
                <AlertDescription>
                    Pour contacter le vendeur, vous devez d'abord{' '}
                    <Button asChild variant="link" className="p-0 h-auto font-semibold">
                        <Link href={`/verify-phone?redirect=/vehicles/${vehicle.id}`}>
                            vérifier votre numéro de téléphone.
                        </Link>
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }
    
    // User is logged in and phone is verified
    const mailSubject = encodeURIComponent(`Intérêt pour votre ${vehicle.make} ${vehicle.model} sur Tacoto.ch`);
    const mailtoLink = `mailto:${seller?.email}?subject=${mailSubject}`;

    return (
         <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {seller.sharePhoneNumber && seller.phone && (
            seller.userType === 'professionnel' ? (
                <Button asChild className="w-full" size="lg">
                <a href={`tel:${seller.phone}`}>
                    <Phone className="mr-2" /> Appeler
                </a>
                </Button>
            ) : (
                <Button asChild className="w-full" size="lg">
                <a href={`https://wa.me/${seller.phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" /> WhatsApp
                </a>
                </Button>
            )
            )}
            <Button asChild className="w-full" variant="outline" size="lg" disabled={!seller.email}>
                <a href={mailtoLink}>
                <Mail className="mr-2" /> E-mail
                </a>
            </Button>
        </div>
    );
}
