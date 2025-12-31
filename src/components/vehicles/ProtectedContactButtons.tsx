'use client';

import { useUser } from "@/firebase/auth/use-user";
import type { UserProfile, Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageCircle, Phone, ShieldAlert, LogIn, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useFirebase } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedContactButtonsProps {
    seller: UserProfile;
    vehicle: Vehicle;
}

export default function ProtectedContactButtons({ seller, vehicle }: ProtectedContactButtonsProps) {
    const { user, loading: userLoading } = useUser();
    const { auth } = useFirebase();
    const { toast } = useToast();
    const [isSigningInAnonymously, setIsSigningInAnonymously] = useState(false);

    const handleAnonymousVerification = async () => {
        if (!auth) return;
        setIsSigningInAnonymously(true);
        try {
            await signInAnonymously(auth);
            // The useUser hook will pick up the new anonymous user state,
            // and the component will re-render, showing the "verify phone" message.
            toast({
                title: "Session anonyme créée",
                description: "Veuillez maintenant vérifier votre numéro de téléphone.",
            });
        } catch (error: any) {
            console.error("Anonymous sign-in error:", error);
            let description = "Impossible de démarrer la vérification. Veuillez réessayer.";
            if (error.code === 'auth/operation-not-allowed') {
                description = "L'authentification anonyme n'est pas activée. Veuillez l'activer dans votre console Firebase (Authentication > Sign-in method).";
            }
            toast({
                variant: "destructive",
                title: "Erreur",
                description: description,
            });
        } finally {
            setIsSigningInAnonymously(false);
        }
    };

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
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Vérifiez votre numéro pour contacter</AlertTitle>
                <AlertDescription>
                    Pour assurer la sécurité de notre communauté, veuillez vérifier votre numéro de téléphone suisse. C'est rapide et ne nécessite pas de compte.
                </AlertDescription>
                <div className="mt-3">
                    <Button onClick={handleAnonymousVerification} disabled={isSigningInAnonymously} className="w-full">
                        {isSigningInAnonymously && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Commencer la vérification
                    </Button>
                     <p className="text-xs text-center mt-2 text-muted-foreground">
                        Déjà un compte ?{' '}
                        <Button asChild variant="link" className="p-0 h-auto text-xs">
                             <Link href="/login">Connectez-vous</Link>
                        </Button>
                    </p>
                </div>
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
    
    // User is logged in (or anonymous) and phone is verified
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
