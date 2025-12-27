'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/sell/SellForm';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SellPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Accès refusé</h1>
            <p className="mt-2 text-muted-foreground">Vous devez être connecté pour vendre un véhicule.</p>
            <Button asChild className="mt-4">
              <Link href="/login">Se connecter</Link>
            </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Vendre votre voiture</h1>
            <p className="mt-2 text-lg text-muted-foreground">Remplissez le formulaire ci-dessous pour créer votre annonce.</p>
          </div>
          <SellForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
