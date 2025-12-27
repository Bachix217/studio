import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Connexion - Tacoto.ch',
  description: 'Connectez-vous à votre compte Tacoto.ch.',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Connexion</h1>
            <p className="mt-2 text-lg text-muted-foreground">Accédez à votre compte pour gérer vos annonces.</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
