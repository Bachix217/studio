import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePageClient from '@/components/vehicles/HomePageClient';
import VehicleSearchForm from '@/components/vehicles/VehicleSearchForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0" aria-hidden="true" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Trouvez votre prochaine voiture en Suisse, <span className="text-primary">sans frais.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              La plateforme de vente automobile 100% gratuite, pensée pour les Suisses. Simple, rapide et sécurisée.
            </p>
            <div className="mt-10 flex justify-center items-center gap-4">
              <Button asChild size="lg" className="shadow-xl shadow-blue-900/20 hover:-translate-y-1 transition-all duration-300">
                <Link href="/sell">Vendre ma voiture</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#listings">
                  Parcourir les annonces
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div id="listings" className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <HomePageClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
