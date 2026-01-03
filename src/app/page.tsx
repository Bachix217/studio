import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePageClient from '@/components/vehicles/HomePageClient';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <HomePageClient />
      </main>
      <Footer />
    </>
  );
}
