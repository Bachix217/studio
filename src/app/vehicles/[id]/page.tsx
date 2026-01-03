'use server';

import VehiclePageClient from '@/components/vehicles/VehiclePageClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getVehicleById } from '@/lib/data';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';


// Initialize Firebase for Server-Side usage
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const db = getFirestore(app);


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vehicle = await getVehicleById(db, params.id);

  if (!vehicle) {
    notFound();
  }

  return {
    title: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - Tacoto.ch`,
    description: `À vendre: ${vehicle.make} ${vehicle.model} de ${vehicle.year} avec ${vehicle.mileage.toLocaleString('fr-CH')} km. ${vehicle.description.substring(0, 120)}...`,
    openGraph: {
      title: `${vehicle.make} ${vehicle.model} - ${vehicle.price} CHF`,
      description: vehicle.description.substring(0, 150),
      images: [
        {
          url: vehicle.images[0],
          width: 1200,
          height: 800,
          alt: `${vehicle.make} ${vehicle.model}`,
        },
      ],
      type: 'article',
    },
     twitter: {
      card: 'summary_large_image',
      title: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - Tacoto.ch`,
      description: vehicle.description.substring(0, 150),
      images: [vehicle.images[0]],
    },
  }
}

export default async function VehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(db, params.id);

  if (!vehicle) {
    // This will be caught by generateMetadata in most cases, but it's a good safeguard.
    notFound();
  }
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VehiclePageClient vehicleId={params.id} vehicle={vehicle} />
      </main>
      <Footer />
    </>
  );
}
