'use server';

import VehiclePageClient from '@/components/vehicles/VehiclePageClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function VehiclePage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VehiclePageClient vehicleId={id} />
      </main>
      <Footer />
    </>
  );
}
