'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecaptchaVerifier, linkWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useUser } from '@/firebase/auth/use-user';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha?: any;
  }
}

export default function VerifyPhonePage() {
  const { user, loading: userLoading } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth]);

  useEffect(() => {
    if (!userLoading && user?.phoneNumber) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [user, userLoading, router, searchParams]);

  const handleSendCode = async () => {
    setError(null);
    if (!phoneNumber.startsWith('+41') || phoneNumber.length < 12) {
      setError('Veuillez entrer un numéro de téléphone suisse valide (ex: +41791234567).');
      return;
    }
    if (!auth || !user || !window.recaptchaVerifier) {
      setError('Le service d\'authentification n\'est pas prêt.');
      return;
    }

    setIsSubmitting(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await linkWithPhoneNumber(user, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setCodeSent(true);
      toast({
        title: 'Code envoyé !',
        description: `Un code de vérification a été envoyé au ${phoneNumber}.`,
      });
    } catch (e: any) {
      console.error("Error sending verification code:", e);
      setError(e.message || "Une erreur est survenue lors de l'envoi du code.");
      // Reset reCAPTCHA so user can try again
      if (window.grecaptcha && window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
            window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez entrer un code de vérification à 6 chiffres.');
      return;
    }
    if (!confirmationResult) {
      setError('Veuillez d\'abord demander un code de vérification.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast({
        title: 'Numéro vérifié !',
        description: 'Votre numéro de téléphone a été vérifié avec succès.',
      });
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (e: any) {
      console.error("Error verifying code:", e);
      setError(e.message || "Code incorrect ou expiré.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Vérification du téléphone</CardTitle>
              <CardDescription>
                Pour des raisons de sécurité, veuillez vérifier votre numéro de téléphone suisse pour pouvoir publier des annonces.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!codeSent ? (
                <div className="space-y-4">
                   <div>
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+41791234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button onClick={handleSendCode} disabled={isSubmitting || !phoneNumber} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer le code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Un code a été envoyé à {phoneNumber}.
                  </p>
                  <div>
                    <Label htmlFor="code">Code de vérification</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="_ _ _ _ _ _"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={isSubmitting}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handleVerifyCode} disabled={isSubmitting || !verificationCode} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Vérifier
                  </Button>
                   <Button variant="link" onClick={() => setCodeSent(false)} disabled={isSubmitting} className="w-full">
                    Changer de numéro
                  </Button>
                </div>
              )}
              {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
               <div id="recaptcha-container"></div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
