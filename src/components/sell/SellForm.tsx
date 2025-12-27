'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CANTONS, FUEL_TYPES, GEARBOX_TYPES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useState, ChangeEvent } from 'react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  make: z.string().min(2, "La marque est requise."),
  model: z.string().min(1, "Le modèle est requis."),
  year: z.coerce.number().min(1900, "Année invalide.").max(new Date().getFullYear() + 1, "Année invalide."),
  price: z.coerce.number().min(1, "Le prix doit être positif."),
  mileage: z.coerce.number().min(0, "Le kilométrage ne peut être négatif."),
  fuelType: z.enum(FUEL_TYPES, { required_error: "Le type de carburant est requis." }),
  gearbox: z.enum(GEARBOX_TYPES, { required_error: "La boîte de vitesses est requise." }),
  canton: z.string().min(2, "Le canton est requis."),
  description: z.string().min(20, "Veuillez fournir une description plus détaillée."),
  features: z.string().optional(),
});

export default function SellForm() {
  const { toast } = useToast();
  const { firestore, storage } = useFirebase();
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: undefined,
      mileage: undefined,
      description: '',
      features: '',
    },
  });

  const validateImages = (files: File[]): boolean => {
    if (files.length === 0) {
      setImageError('Au moins une image est requise.');
      return false;
    }
    if (files.length > MAX_IMAGES) {
      setImageError(`Vous ne pouvez téléverser que ${MAX_IMAGES} images maximum.`);
      return false;
    }
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`Chaque image doit peser moins de 5 Mo.`);
        return false;
      }
    }
    setImageError(null);
    return true;
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(files);
    if (files.length > 0) {
      validateImages(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    } else {
      setImagePreviews([]);
      validateImages([]);
    }
  };
  
  const handleImageUpload = async () => {
    if (!validateImages(imageFiles) || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const storageRef = ref(storage, `vehicles/${user.uid}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const totalProgress = (i / imageFiles.length) * 100 + progress / imageFiles.length;
              setUploadProgress(totalProgress);
            },
            (error) => {
              console.error("Upload failed", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }
      setImageUrls(uploadedUrls);
      toast({ title: "Images téléversées avec succès !" });
      setStep(2);

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Erreur de téléversement",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Vous n'êtes pas connecté",
      });
      return;
    }
     if (imageUrls.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune image téléversée",
        description: "Veuillez retourner à l'étape précédente et téléverser des images.",
      });
      return;
    }


    try {
      const docRef = await addDoc(collection(firestore, 'vehicles'), {
        ...values,
        year: Number(values.year),
        price: Number(values.price),
        mileage: Number(values.mileage),
        features: values.features ? values.features.split(',').map(f => f.trim()) : [],
        images: imageUrls,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Annonce publiée !",
        description: "Votre annonce a été ajoutée avec succès.",
      });
      
      router.push(`/vehicles/${docRef.id}`);

    } catch (error: any) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la publication",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium">Étape 1 sur 2 : Photos du véhicule</h3>
              <p className="text-sm text-muted-foreground">Téléversez jusqu'à {MAX_IMAGES} photos de votre voiture.</p>
            </div>
             <FormItem>
                <FormLabel>Photos ({imagePreviews.length}/{MAX_IMAGES})</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez</p>
                        <p className="text-xs text-muted-foreground">Jusqu'à {MAX_IMAGES} images (max 5Mo chacune)</p>
                      </div>
                      <Input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div> 
                </FormControl>
                {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square w-full rounded-md overflow-hidden">
                        <Image src={src} alt={`Aperçu ${index}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
            </FormItem>
            
            {uploadProgress !== null && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Téléversement en cours...</p>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
              </div>
            )}

            <Button onClick={handleImageUpload} disabled={isUploading || imageFiles.length === 0 || !!imageError}>
              {isUploading ? 'Téléversement...' : 'Continuer'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Étape 2 sur 2 : Détails de l'annonce</h3>
                        <p className="text-sm text-muted-foreground">Renseignez les informations sur votre véhicule.</p>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => setStep(1)}>Modifier les photos</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                    {imageUrls.map((src, index) => (
                      <div key={index} className="relative aspect-square w-full rounded-md overflow-hidden">
                        <Image src={src} alt={`Véhicule ${index}`} fill className="object-cover" />
                      </div>
                    ))}
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl><Input placeholder="ex: Volkswagen" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <FormControl><Input placeholder="ex: Golf" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl><Input type="number" placeholder="ex: 2021" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (CHF)</FormLabel>
                      <FormControl><Input type="number" placeholder="ex: 32000" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilométrage</FormLabel>
                      <FormControl><Input type="number" placeholder="ex: 45000" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carburant</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {FUEL_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gearbox"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boîte de vitesses</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {GEARBOX_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="canton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canton</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {CANTONS.map(canton => <SelectItem key={canton.value} value={canton.value}>{canton.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Décrivez votre voiture en détail..." rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipements</FormLabel>
                    <FormControl>
                      <Input placeholder="Climatisation, Sièges chauffants, Toit ouvrant..." {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">Séparez les équipements par une virgule.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Publication en cours...' : "Soumettre l'annonce"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
