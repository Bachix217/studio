'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';

const signupSchema = z.object({
    email: z.string().email("L'adresse e-mail est invalide."),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
    phone: z.string().regex(/^\+41\d{9}$/, 'Veuillez entrer un numéro suisse valide (ex: +41791234567).'),
});

const verifySchema = z.object({
    code: z.string().min(6, 'Le code doit contenir 6 chiffres.'),
});


export default function SignupForm() {
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const router = useRouter();

  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use a ref to hold the RecaptchaVerifier instance
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      phone: '+41',
    },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });
  
  useEffect(() => {
    if (auth && !recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, [auth]);


  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth || !recaptchaVerifierRef.current) return;
    setIsSubmitting(true);
    
    try {
      const appVerifier = recaptchaVerifierRef.current;
      const confirmation = await signInWithPhoneNumber(auth, values.phone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('verify');
      toast({
        title: 'Code envoyé !',
        description: `Un code a été envoyé au ${values.phone}.`,
      });
    } catch (error: any) {
      console.error("SMS sending error:", error);
      toast({
        variant: 'destructive',
        title: "Erreur d'envoi du SMS",
        description: "Impossible d'envoyer le code de vérification. Assurez-vous que le numéro est correct et réessayez.",
      });
       // Reset reCAPTCHA on error
       if (recaptchaVerifierRef.current) {
         recaptchaVerifierRef.current.render().then((widgetId) => {
             // @ts-ignore
            window.grecaptcha.reset(widgetId);
         });
       }
    } finally {
        setIsSubmitting(false);
    }
  }

  async function onVerifySubmit(values: z.infer<typeof verifySchema>) {
     if (!auth || !firestore || !confirmationResult) return;
     setIsSubmitting(true);
     
     const { email, password, phone } = signupForm.getValues();

     try {
        // First, confirm the phone number
        await confirmationResult.confirm(values.code);
        
        // Then, create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Finally, create the user profile with the verified phone number
        const newUserProfile: Omit<UserProfile, 'createdAt'> = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.email?.split('@')[0] || 'Utilisateur',
            phone: phone, // The verified phone number
            sharePhoneNumber: false,
            userType: 'particulier',
        };

        await setDoc(doc(firestore, "users", user.uid), {
            ...newUserProfile,
            createdAt: serverTimestamp(),
        });
        
        toast({
            title: 'Inscription réussie !',
            description: 'Votre compte a été créé et vérifié avec succès.',
        });
        router.push('/');

     } catch (error: any) {
        console.error("Verification or user creation error:", error);
        toast({
            variant: 'destructive',
            title: "Erreur de vérification",
            description: error.code === 'auth/invalid-verification-code'
                ? 'Le code est incorrect. Veuillez réessayer.'
                : "Une erreur est survenue lors de la finalisation de l'inscription.",
        });
     } finally {
        setIsSubmitting(false);
     }
  }

  return (
    <Card>
       <div id="recaptcha-container"></div>
      {step === 'signup' && (
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
            <CardContent className="p-6 space-y-4">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+41791234567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un code SMS sera envoyé pour vérifier votre numéro. Cette étape est essentielle pour lutter contre la fraude et les faux profils (brouteurs).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6 pt-0">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi...' : 'Envoyer le code de vérification'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Déjà un compte ?{' '}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/login">Connectez-vous</Link>
                </Button>
              </p>
            </CardFooter>
          </form>
        </Form>
      )}

      {step === 'verify' && (
        <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)}>
                 <CardContent className="p-6 space-y-4">
                    <p className="text-center text-muted-foreground">Un code a été envoyé au <span className="font-semibold text-foreground">{signupForm.getValues().phone}</span>.</p>
                     <FormField
                        control={verifyForm.control}
                        name="code"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code de vérification</FormLabel>
                            <FormControl>
                            <Input placeholder="123456" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </CardContent>
                 <CardFooter className="flex flex-col gap-4 p-6 pt-0">
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Vérification...' : "Vérifier et créer le compte"}
                    </Button>
                     <Button 
                        variant="link" 
                        onClick={() => setStep('signup')}
                        disabled={isSubmitting}
                        className="p-0 h-auto"
                    >
                      Changer de numéro de téléphone
                    </Button>
                 </CardFooter>
            </form>
        </Form>
      )}
    </Card>
  );
}
