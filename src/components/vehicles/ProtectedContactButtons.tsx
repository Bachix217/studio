'use client';

import { useUser } from "@/firebase/auth/use-user";
import type { UserProfile, Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageCircle, Phone, LogIn, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface ProtectedContactButtonsProps {
    seller: UserProfile;
    vehicle: Vehicle;
}

export default function ProtectedContactButtons({ seller, vehicle }: ProtectedContactButtonsProps) {
    const { user, loading: userLoading } = useUser();

    if (userLoading) {
        return (
            <div className="pt-2">
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Une communauté de confiance avant tout</AlertTitle>
                <AlertDescription>
                   Pour protéger nos utilisateurs contre les tentatives de fraude, fréquentes sur les plateformes gratuites, un compte est requis pour contacter un vendeur. Cela nous permet de garantir des interactions plus sûres.
                </AlertDescription>
                <div className="mt-4">
                    <Button asChild className="w-full">
                         <Link href={`/login?redirect=/vehicles/${vehicle.id}`}>
                            Se connecter ou créer un compte
                        </Link>
                    </Button>
                </div>
            </Alert>
        );
    }
    
    // User is logged in
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
