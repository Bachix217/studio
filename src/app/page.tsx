import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePageClient from '@/components/vehicles/HomePageClient';
import VehicleSearchForm from '@/components/vehicles/VehicleSearchForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground">
            Trouvez votre prochaine voiture en Suisse, <span className="text-primary">sans frais.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Tacoto.ch est une plateforme 100% gratuite pour les particuliers. Pas de frais de publication, pas de commissions. Vendez et achetez en toute simplicité.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="animate-pulse hover:animate-none">
              <Link href="/sell">Vendre mon véhicule</Link>
            </Button>
          </div>
        </div>
        
        <HomePageClient />
      </main>
      <Footer />
    </>
  );
}
