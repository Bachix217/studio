'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CatchCarClient from '@/components/catch-car/CatchCarClient';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CatchCarPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login?redirect=/catch-car');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Accès sécurisé</h1>
             <p className="mt-2 text-muted-foreground max-w-prose">
                Pour vous offrir une expérience personnalisée et sauvegarder vos préférences, un compte est nécessaire.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login?redirect=/catch-car">Se connecter</Link>
            </Button>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary">CatchCar</h1>
            <p className="mt-2 text-lg text-muted-foreground">Swipez pour trouver la voiture de vos rêves.</p>
        </div>
        <CatchCarClient />
      </main>
      <Footer />
    </div>
  );
}
