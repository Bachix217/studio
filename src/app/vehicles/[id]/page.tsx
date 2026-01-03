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
// Importe ta fonction de sérialisation ici
import { serializeTimestamps } from '@/lib/serialization'; 

// ... (Initialisation Firebase identique)

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vehicle = await getVehicleById(db, params.id);
  if (!vehicle) notFound();

  const baseUrl = 'https://tacoto.ch';
  const imageUrl = vehicle.images?.[0]?.startsWith('http') 
    ? vehicle.images[0] 
    : `${baseUrl}${vehicle.images?.[0] || '/default-share-image.jpg'}`;

  return {
    title: `${vehicle.make} ${vehicle.model} (${vehicle.year}) - Tacoto.ch`,
    description: `À vendre: ${vehicle.make} ${vehicle.model} de ${vehicle.year}. Prix: ${vehicle.price} CHF.`,
    openGraph: {
      title: `${vehicle.make} ${vehicle.model} - Tacoto.ch`,
      description: vehicle.description.substring(0, 150),
      url: `${baseUrl}/vehicles/${params.id}`,
      siteName: 'Tacoto.ch',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: 'fr_CH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      images: [imageUrl],
    },
  }
}

export default async function VehiclePage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(db, params.id);

  if (!vehicle) notFound();

  // IMPORTANT: On sérialise avant d'envoyer au composant Client
  const serializedVehicle = serializeTimestamps(vehicle);
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* On passe l'objet sérialisé ici */}
        <VehiclePageClient vehicleId={params.id} vehicle={serializedVehicle} />
      </main>
      <Footer />
    </>
  );
}