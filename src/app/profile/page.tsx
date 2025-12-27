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
  website: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal('')),
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
      const updateData: Partial<UserProfile> = {
        ...values,
        uid: user.uid,
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
        description: 'Impossible de mettre à jour le profil. ' + error.message,
      });
    }
  }

  if (userLoading || isProfileLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Card className="mt-8">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
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
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos informations publiques et vos paramètres de compte.
              </p>
          </header>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              
              <Card>
                <CardHeader>
                  <CardTitle>Type de Compte</CardTitle>
                  <CardDescription>Sélectionnez le type de compte qui vous correspond.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-6"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="particulier" />
                              </FormControl>
                              <FormLabel className="font-normal text-base">
                                Particulier
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="professionnel" />
                              </FormControl>
                              <FormLabel className="font-normal text-base">
                                Professionnel
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                  <CardTitle>Informations Publiques</CardTitle>
                  <CardDescription>Ces informations seront affichées sur vos annonces.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'affichage public</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom ou pseudonyme" {...field} />
                        </FormControl>
                         <FormDescription>
                          Ce nom sera visible par les autres utilisateurs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {userType === 'particulier' && (
                    <>
                    <Separator />
                     <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone de contact (pour WhatsApp)</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+41 79 123 45 67" {...field} value={field.value ?? ''} />
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
                                Partager mon numéro
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
                    </>
                  )}
                </CardContent>
              </Card>

              {userType === 'professionnel' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Professionnelles</CardTitle>
                    <CardDescription>Renseignez les détails de votre entreprise pour inspirer confiance aux acheteurs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                     <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'entreprise</FormLabel>
                            <FormControl>
                              <Input placeholder="Garage du Lac SA" {...field} value={field.value ?? ''}/>
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
                              <Input placeholder="Route de Lausanne 1, 1202 Genève" {...field} value={field.value ?? ''}/>
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
                              <Input type="url" placeholder="https://www.votregarage.ch" {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone de contact</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+41 22 123 45 67" {...field} value={field.value ?? ''} />
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
                                Partager le numéro de téléphone
                              </FormLabel>
                              <FormDescription>
                                Autoriser les acheteurs à vous appeler via vos annonces.
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
                  </CardContent>
                </Card>
              )}


              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                  {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
