'use server';

import { getFirestore, doc, getDoc, initializeApp, getApps, getApp } from 'firebase/firestore';
import type { Metadata } from 'next';
import type { Vehicle } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';
import { formatCurrency } from '@/lib/utils';
import VehiclePageClient from '@/components/vehicles/VehiclePageClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const vehicleDocRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(vehicleDocRef);

    if (docSnap.exists()) {
      const vehicle = docSnap.data() as Vehicle;
      
      if (vehicle.published && vehicle.status === 'approved') {
        const title = `${vehicle.make} ${vehicle.model} de ${vehicle.year} - ${formatCurrency(vehicle.price)}`;
        const description = `Découvrez cette ${vehicle.make} ${vehicle.model} à ${vehicle.canton}. ${vehicle.mileage.toLocaleString('fr-CH')} km, ${vehicle.gearbox}. ${vehicle.description.substring(0, 120)}...`;
        const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : undefined;

        return {
          title: title,
          description: description,
          openGraph: {
            title: title,
            description: description,
            images: imageUrl ? [imageUrl] : [],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  return {
    title: "Annonce non trouvée",
    description: "Cette annonce n'est plus disponible.",
  };
}


export default async function VehiclePage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  // Basic validation server-side to quickly check if the document might exist.
  // The client will do the full fetching and validation.
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const vehicleDocRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(vehicleDocRef);
    if (!docSnap.exists()) {
        notFound();
    }
    const data = docSnap.data();
    if (!data.published || data.status !== 'approved') {
        notFound();
    }
  } catch (e) {
    // If server check fails, let client handle it, but it might lead to notFound on client.
    console.error("Server-side pre-check failed:", e);
  }


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
