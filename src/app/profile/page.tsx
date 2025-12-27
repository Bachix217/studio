'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useUser } from '@/firebase/auth/use-user';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  phone: z.string().optional(),
  sharePhoneNumber: z.boolean().optional(),
  userType: z.enum(['particulier', 'professionnel']).default('particulier'),
  companyName: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
}).refine(data => {
    if (data.userType === 'professionnel') {
        return !!data.companyName && data.companyName.length > 2;
    }
    return true;
}, {
    message: "Le nom de l'entreprise est requis pour les professionnels.",
    path: ['companyName'],
});

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      phone: '',
      sharePhoneNumber: false,
      userType: 'particulier',
      companyName: '',
      address: '',
      website: '',
    },
  });
  
  const userType = form.watch('userType');

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firestore) return;

    const profileDocRef = doc(firestore, 'users', user.uid);
    
    const fetchOrCreateProfile = async () => {
      const docSnap = await getDoc(profileDocRef);
      let userProfile: UserProfile;

      if (docSnap.exists()) {
        userProfile = docSnap.data() as UserProfile;
      } else {
        // Profile doesn't exist, create a new one
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          phone: '',
          sharePhoneNumber: false,
          createdAt: serverTimestamp(),
          userType: 'particulier',
        };
        await setDoc(profileDocRef, newProfile);
        userProfile = { ...newProfile, createdAt: new Date() }; // Approximate createdAt for client side
      }
      
      setProfile(userProfile);
      form.reset({
        displayName: userProfile.displayName,
        phone: userProfile.phone || '',
        sharePhoneNumber: userProfile.sharePhoneNumber || false,
        userType: userProfile.userType || 'particulier',
        companyName: userProfile.companyName || '',
        address: userProfile.address || '',
        website: userProfile.website || '',
      });
      setIsProfileLoading(false);
    };

    fetchOrCreateProfile();
    
  }, [user, userLoading, firestore, router, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !firestore) return;

    const profileDocRef = doc(firestore, 'users', user.uid);
    try {
      // Ensure email is not overwritten if it exists
      const updateData: UserProfile = {
        ...profile, // Keep existing fields like email and createdAt
        uid: user.uid,
        ...values,
      };

      if(values.userType === 'particulier') {
        updateData.companyName = '';
        updateData.address = '';
        updateData.website = '';
      }

      await setDoc(profileDocRef, updateData, { merge: true });
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
      });
    }
  }

  if (userLoading || isProfileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32 mt-4" />
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>
                Mettez à jour vos informations. Celles-ci seront visibles par les acheteurs potentiels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Type de compte</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="particulier" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Particulier
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="professionnel" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Professionnel
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />
                  
                  <h4 className="text-lg font-medium">Informations de contact</h4>

                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'affichage</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom ou pseudonyme" {...field} />
                        </FormControl>
                         <FormDescription>
                          Ce nom sera affiché publiquement sur vos annonces.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone (pour WhatsApp)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+41" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="sharePhoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Partager mon téléphone
                          </FormLabel>
                          <FormDescription>
                            Autoriser les acheteurs à vous contacter via WhatsApp.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {userType === 'professionnel' && (
                    <>
                      <Separator />
                      <h4 className="text-lg font-medium">Informations professionnelles</h4>
                      <div className="space-y-8">
                         <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom de l'entreprise</FormLabel>
                                <FormControl>
                                  <Input placeholder="Garage du Lac SA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse</FormLabel>
                                <FormControl>
                                  <Input placeholder="Route de Lausanne 1, 1202 Genève" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Site web</FormLabel>
                                <FormControl>
                                  <Input type="url" placeholder="https://www.votregarage.ch" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>
                    </>
                  )}


                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
