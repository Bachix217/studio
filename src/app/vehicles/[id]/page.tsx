import { getFirestore, doc, getDoc, initializeApp, getApps, getApp } from 'firebase/firestore';
import type { Metadata } from 'next';
import type { Vehicle } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';
import { formatCurrency } from '@/lib/utils';
import VehiclePageClient from '@/components/vehicles/VehiclePageClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { notFound } from 'next/navigation';

// Cette fonction s'exécute sur le serveur pour générer les métadonnées pour le SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const vehicleDocRef = doc(db, 'vehicles', id);
    const docSnap = await getDoc(vehicleDocRef);

    if (docSnap.exists()) {
      const vehicle = docSnap.data() as Vehicle;
      // On s'assure que l'annonce est bien publiée
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
  
  // Métadonnées par défaut si l'annonce n'est pas trouvée ou en cas d'erreur
  return {
    title: "Annonce non trouvée",
    description: "Cette annonce n'est plus disponible.",
  };
}

// Composant serveur qui récupère les données initiales
export default async function VehiclePage({ params }: { params: { id: string } }) {
  const id = params.id;
  let initialVehicle: Vehicle | null = null;

  try {
     const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
     const db = getFirestore(app);
     const vehicleDocRef = doc(db, 'vehicles', id);
     const docSnap = await getDoc(vehicleDocRef);
     
     if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.published && data.status === 'approved') {
            initialVehicle = { id: docSnap.id, ...data } as Vehicle;
        }
     }
  } catch (error) {
     console.error("Error fetching initial vehicle data:", error);
  }

  if (!initialVehicle) {
      notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VehiclePageClient vehicleId={id} initialVehicle={initialVehicle} />
      </main>
      <Footer />
    </>
  );
}
