import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/sell/SellForm';

export const metadata = {
  title: 'Vendre votre voiture - Tacoto.ch',
  description: 'Mettez votre voiture en vente facilement et rapidement sur Tacoto.ch.',
};

export default function SellPage() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Vendre votre voiture</h1>
            <p className="mt-2 text-lg text-muted-foreground">Remplissez le formulaire ci-dessous pour créer votre annonce.</p>
          </div>
          <SellForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
