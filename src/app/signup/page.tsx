import SignupForm from '@/components/auth/SignupForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Inscription - Tacoto.ch',
  description: 'Créez un compte pour vendre votre voiture sur Tacoto.ch.',
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Créer un compte</h1>
            <p className="mt-2 text-lg text-muted-foreground">Rejoignez la communauté Tacoto.ch.</p>
          </div>
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
