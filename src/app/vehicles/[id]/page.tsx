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
import { serializeTimestamps } from '@/lib/serialization';
import type { Vehicle } from '@/lib/types';

// Initialisation "légère" de Firebase pour le côté serveur
let db: ReturnType<typeof getFirestore>;
try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase initialization error on server:", e);
    // Gérer l'erreur ou laisser les fonctions qui en dépendent échouer gracieusement
}


export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!db) {
    return {
      title: 'Tacoto.ch',
      description: 'Achetez et vendez des voitures en Suisse.'
    };
  }

  const vehicle = await getVehicleById(db, params.id);
  if (!vehicle || !vehicle.published) {
    notFound();
  }

  const title = `${vehicle.make} ${vehicle.model} (${vehicle.year}) - Voiture d'occasion en Suisse`;
  const description = `Achetez cette ${vehicle.make} ${vehicle.model} de ${vehicle.year} pour ${vehicle.price} CHF sur Tacoto.ch, la plateforme de confiance pour l'achat de véhicules d'occasion en Suisse.`;

  const imageUrl = vehicle.images?.[0]?.startsWith('http')
    ? vehicle.images[0]
    : `https://tacoto.ch/default-share-image.jpg`;

  return {
    metadataBase: new URL('https://tacoto.ch'),
    title: title,
    description: description,
    alternates: {
      canonical: `/vehicles/${params.id}`,
    },
    openGraph: {
      title: title,
      description: description.substring(0, 150),
      url: `/vehicles/${params.id}`,
      siteName: 'Tacoto.ch',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: 'fr_CH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description.substring(0, 150),
      images: [imageUrl],
    },
  };
}

export default async function VehiclePage({ params }: { params: { id: string } }) {
  if (!db) {
    // Affiche un message d'erreur si la base de données n'est pas disponible
    return (
      <>
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Erreur de connexion</h1>
                <p className="text-muted-foreground mt-2">Impossible de se connecter à la base de données. Veuillez réessayer plus tard.</p>
            </div>
        </main>
        <Footer />
      </>
    );
  }
  
  const vehicle = await getVehicleById(db, params.id);

  if (!vehicle || !vehicle.published) {
    notFound();
  }

  // Sérialisation avant d'envoyer au composant Client
  const serializedVehicle = serializeTimestamps(vehicle) as Vehicle;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.make} ${vehicle.model}`,
    image: vehicle.images,
    description: vehicle.description,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    vehicleIdentificationNumber: vehicle.id,
    productionDate: vehicle.year.toString(),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CHF',
      price: vehicle.price,
      availability: 'https://schema.org/InStock',
      url: `https://tacoto.ch/vehicles/${vehicle.id}`,
      seller: {
        '@type': 'Person', // ou 'Organization' si vous avez des vendeurs pro
        name: vehicle.userId, // Idéalement, il faudrait le nom du vendeur ici
      },
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <VehiclePageClient vehicleId={params.id} vehicle={serializedVehicle} />
      </main>
      <Footer />
    </>
  );
}