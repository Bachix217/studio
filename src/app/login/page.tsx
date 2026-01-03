'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';

function LoginFormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full mt-4" />
        </div>
    )
}


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
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
