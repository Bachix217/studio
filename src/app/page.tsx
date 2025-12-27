import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePageClient from '@/components/vehicles/HomePageClient';
import { getVehicles } from '@/lib/data';

export default async function Home() {
  const vehicles = await getVehicles();

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HomePageClient initialVehicles={vehicles} />
      </main>
      <Footer />
    </>
  );
}
