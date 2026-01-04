'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CANTONS, FUEL_TYPES, GEARBOX_TYPES, DOORS_TYPES, SEATS_TYPES, DRIVE_TYPES, CONDITION_TYPES, POWER_UNITS, EXTERIOR_COLORS, INTERIOR_COLORS, COMMON_VEHICLE_FEATURES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Check, ChevronsUpDown, Info, X, PlusCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useState, ChangeEvent, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import imageCompression from 'browser-image-compression';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import type { Vehicle } from '@/lib/types';
import { getMakes, getModels, type Make, type Model } from '@/app/sell/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '../ui/badge';


const MAX_IMAGES = 10;

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
  features: z.array(z.string()).optional(),
  doors: z.coerce.number({invalid_type_error: "Requis"}).min(2).max(7),
  seats: z.coerce.number({invalid_type_error: "Requis"}).min(2).max(9),
  drive: z.enum(DRIVE_TYPES, { required_error: "Le type de traction est requis."}),
  power: z.coerce.number().min(10, "La puissance est requise."),
  powerUnit: z.enum(POWER_UNITS),
  exteriorColor: z.enum(EXTERIOR_COLORS, { required_error: "La couleur est requise."}),
  interiorColor: z.enum(INTERIOR_COLORS, { required_error: "La couleur est requise."}),
  condition: z.enum(CONDITION_TYPES, { required_error: "L'état est requis."}),
  nonSmoker: z.boolean().default(false),
});

interface SellFormProps {
  vehicleToEdit?: Vehicle;
}

export default function SellForm({ vehicleToEdit }: SellFormProps) {
  const { toast } = useToast();
  const { firestore, storage } = useFirebase();
  const { user } = useUser();
  const router = useRouter();

  const isEditMode = !!vehicleToEdit;
  
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [step, setStep] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(isEditMode ? vehicleToEdit.images : []);
  const [imageUrls, setImageUrls] = useState<string[]>(isEditMode ? vehicleToEdit.images : []);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isMakePopoverOpen, setIsMakePopoverOpen] = useState(false);
  const [isModelPopoverOpen, setIsModelPopoverOpen] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
      ...vehicleToEdit,
      year: vehicleToEdit?.year || new Date().getFullYear(),
      price: vehicleToEdit?.price,
      mileage: vehicleToEdit?.mileage,
      powerUnit: vehicleToEdit?.powerUnit || 'cv',
      nonSmoker: vehicleToEdit?.nonSmoker || false,
      features: vehicleToEdit?.features || [],
    } : {
      year: new Date().getFullYear(),
      powerUnit: 'cv',
      nonSmoker: false,
      features: [],
    },
  });
  
  const selectedMakeName = form.watch('make');

  useEffect(() => {
    async function loadMakes() {
      if (step !== 2) return;
      setIsLoadingMakes(true);
      try {
        const makesData = await getMakes();
        setMakes(makesData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des marques.",
        });
      } finally {
        setIsLoadingMakes(false);
      }
    }
    loadMakes();
  }, [step, toast]);
  
  useEffect(() => {
    async function loadModels() {
        if (!selectedMakeName) {
            setModels([]);
            return;
        }

        setIsLoadingModels(true);
        try {
            // CarAPI uses the make name for filtering models
            const modelsData = await getModels(selectedMakeName);
            setModels(modelsData);
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erreur de chargement",
                description: `Impossible de charger les modèles pour ${selectedMakeName}.`,
            });
        } finally {
            setIsLoadingModels(false);
        }
    }
    loadModels();
  }, [selectedMakeName, toast]);


  useEffect(() => {
    if (isEditMode && vehicleToEdit) {
      form.reset({
        ...vehicleToEdit,
        features: vehicleToEdit.features || [],
      });
      if (vehicleToEdit.images && vehicleToEdit.images.length > 0) {
        setImagePreviews(vehicleToEdit.images);
        setImageUrls(vehicleToEdit.images);
      }
      setStep(2);
    }
  }, [isEditMode, vehicleToEdit, form]);


  const validateImages = (files: File[]): boolean => {
    const totalImages = imagePreviews.length + files.length - (isEditMode ? vehicleToEdit.images.length : 0);
    
    if (totalImages === 0 && !isEditMode) {
      setImageError('Au moins une image est requise.');
      return false;
    }
    if (totalImages > MAX_IMAGES) {
      setImageError(`Vous ne pouvez téléverser que ${MAX_IMAGES} images maximum.`);
      return false;
    }
    setImageError(null);
    return true;
  };
  
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) {
        if (!isEditMode) {
            setImageFiles([]);
            setImagePreviews([]);
        }
        setImageError(null);
        return;
    }

    if (!validateImages(files)) {
        setImageFiles([]);
        return;
    }
    
    setIsCompressing(true);
    toast({ title: 'Compression des images...', description: 'Veuillez patienter.' });
    
    try {
        const compressionOptions = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        const compressedFiles = await Promise.all(
            files.map(file => imageCompression(file, compressionOptions))
        );
        
        setImageFiles(prev => [...prev, ...compressedFiles]);
        const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setImageError(null);
        toast({ title: 'Compression terminée !', description: 'Vos images sont prêtes à être téléversées.' });

    } catch (error) {
        console.error('Image compression error:', error);
        setImageError('Une erreur est survenue lors de la compression des images.');
        toast({ variant: 'destructive', title: 'Erreur de compression', description: 'Impossible de compresser les images.' });
    } finally {
        setIsCompressing(false);
    }
};

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) {
        setStep(2);
        return;
    }
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

      const finalImageUrls = isEditMode ? [...imageUrls, ...uploadedUrls] : uploadedUrls;
      setImageUrls(finalImageUrls);

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
      const dataToSave: any = {
        ...values,
        year: Number(values.year),
        price: Number(values.price),
        mileage: Number(values.mileage),
        features: values.features,
        images: imageUrls,
        userId: user.uid,
        status: 'pending',
        published: false,
      };

      if (isEditMode && vehicleToEdit) {
        const docRef = doc(firestore, 'vehicles', vehicleToEdit.id);
        dataToSave.updatedAt = serverTimestamp();
        await updateDoc(docRef, dataToSave);
        toast({
          title: "Annonce modifiée !",
          description: "Votre annonce a été soumise pour approbation.",
        });
        router.push(`/my-listings`);

      } else {
        const docRef = await addDoc(collection(firestore, 'vehicles'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast({
          title: "Annonce envoyée pour approbation !",
          description: "Votre annonce sera vérifiée avant d'être publiée.",
        });
        router.push(`/my-listings`);
      }
      
    } catch (error: any) {
      console.error("Error saving document: ", error);
      toast({
        variant: "destructive",
        title: isEditMode ? "Erreur de modification" : "Erreur lors de la publication",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Étape 1 sur 2 : Photos du véhicule</h3>
                <p className="text-sm text-muted-foreground">Téléversez jusqu'à ${MAX_IMAGES} photos de votre voiture.</p>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="dropzone-file">Photos ({imagePreviews.length}/{MAX_IMAGES})</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez</p>
                        <p className="text-xs text-muted-foreground">Jusqu'à ${MAX_IMAGES} images, elles seront compressées</p>
                      </div>
                      <Input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleImageChange}
                        disabled={isUploading || isCompressing}
                      />
                    </label>
                  </div> 
                  {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-4">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square w-full rounded-md overflow-hidden">
                          <Image src={src} alt={`Aperçu ${index}`} sizes="100px" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              
              {uploadProgress !== null && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Téléversement en cours...</p>
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                </div>
              )}

              <Button onClick={handleImageUpload} disabled={isUploading || isCompressing || (imagePreviews.length === 0 && !isEditMode) || !!imageError}>
                {isUploading ? 'Téléversement...' : (isCompressing ? 'Compression...' : 'Continuer')}
              </Button>
            </div>
          )}

          {step === 2 && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                    <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                    <AlertDescription>
                        Tacoto.ch est un projet entièrement gratuit. L'amélioration de l'automatisation (comme la liste des modèles) prend du temps. Nous vous remercions pour votre compréhension et votre contribution !
                    </AlertDescription>
                </Alert>
                <div>
                  <div className="flex items-center justify-between">
                      <div>
                          <h3 className="text-lg font-medium">{isEditMode ? 'Modifier les détails' : 'Étape 2 sur 2 : Détails de l\'annonce'}</h3>
                          <p className="text-sm text-muted-foreground">Renseignez les informations sur votre véhicule.</p>
                      </div>
                      {!isEditMode && <Button variant="outline" size="sm" onClick={() => setStep(1)}>Modifier les photos</Button>}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-4">
                      {imageUrls.map((src, index) => (
                        <div key={index} className="relative aspect-square w-full rounded-md overflow-hidden">
                          <Image src={src} alt={`Véhicule ${index}`} sizes="100px" fill className="object-cover" />
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Marque</FormLabel>
                        <Popover open={isMakePopoverOpen} onOpenChange={setIsMakePopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isLoadingMakes}
                              >
                                {isLoadingMakes ? "Chargement..." : field.value || "Sélectionner une marque"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher une marque..." />
                              <CommandList>
                                <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                                <CommandGroup>
                                  {makes.map((make) => (
                                    <CommandItem
                                      value={make.name}
                                      key={make.id}
                                      onSelect={() => {
                                        form.setValue("make", make.name);
                                        form.setValue("model", ""); // Reset model on make change
                                        setIsMakePopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          make.name === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {make.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                         <FormDescription>
                          Si votre marque n'est pas dans la liste, tapez-la simplement.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Modèle</FormLabel>
                        <Popover open={isModelPopoverOpen} onOpenChange={setIsModelPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                               <div className="relative">
                                <Input
                                    placeholder={isLoadingModels ? "Chargement..." : "Taper le modèle"}
                                    className="w-full"
                                    {...field}
                                    disabled={!selectedMakeName || isLoadingModels}
                                />
                               </div>
                            </FormControl>
                          </PopoverTrigger>
                           <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher un modèle..."/>
                              <CommandList>
                                <CommandEmpty>Aucun modèle trouvé. Vous pouvez l'entrer manuellement.</CommandEmpty>
                                <CommandGroup>
                                  {models.map((model) => (
                                    <CommandItem
                                      value={model.name}
                                      key={model.id}
                                      onSelect={() => {
                                        form.setValue("model", model.name);
                                        setIsModelPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          model.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {model.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                    name="drive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de traction</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {DRIVE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name="doors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de portes</FormLabel>
                         <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {DOORS_TYPES.map(type => <SelectItem key={type} value={String(type)}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de places</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {SEATS_TYPES.map(type => <SelectItem key={type} value={String(type)}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="flex gap-2">
                        <FormField
                        control={form.control}
                        name="power"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel>Puissance</FormLabel>
                                <FormControl><Input type="number" placeholder="ex: 150" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="powerUnit"
                        render={({ field }) => (
                            <FormItem className="flex-shrink-0 self-end">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {POWER_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="exteriorColor"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Couleur extérieure</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {EXTERIOR_COLORS.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="interiorColor"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Couleur intérieure</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {INTERIOR_COLORS.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                 <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>État du véhicule</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                {CONDITION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="nonSmoker"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4 md:mt-0">
                                <div className="space-y-0.5">
                                <FormLabel>Véhicule non-fumeur</FormLabel>
                                <FormDescription>
                                    Cochez si le véhicule est non-fumeur.
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
                </div>

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
                         <div className="flex flex-col gap-4">
                            <FeaturesCombobox
                              selectedFeatures={field.value || []}
                              onFeaturesChange={field.onChange}
                            />
                             <div className="flex flex-wrap gap-2">
                                {(field.value || []).map((feature) => (
                                <Badge key={feature} variant="secondary" className="pl-3 pr-2 py-1 text-sm">
                                    {feature}
                                    <button
                                    type="button"
                                    className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onClick={() => field.onChange(field.value?.filter(f => f !== feature))}
                                    >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                                ))}
                            </div>
                         </div>
                      </FormControl>
                      <FormDescription>
                        Sélectionnez ou ajoutez des équipements pour votre véhicule.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Sauvegarde...' : (isEditMode ? 'Enregistrer les modifications' : 'Soumettre l\'annonce')}
                </Button>
              </form>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}

// Sub-component for the features combobox
interface FeaturesComboboxProps {
    selectedFeatures: string[];
    onFeaturesChange: (features: string[]) => void;
}
  
function FeaturesCombobox({ selectedFeatures, onFeaturesChange }: FeaturesComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const toggleFeature = (feature: string) => {
        const newFeatures = selectedFeatures.includes(feature)
        ? selectedFeatures.filter(f => f !== feature)
        : [...selectedFeatures, feature];
        onFeaturesChange(newFeatures);
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && inputValue) {
            event.preventDefault();
            if (inputValue.trim() && !selectedFeatures.includes(inputValue)) {
                onFeaturesChange([...selectedFeatures, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const unselectedFeatures = COMMON_VEHICLE_FEATURES.filter(f => !selectedFeatures.includes(f));

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start font-normal text-muted-foreground"
          >
             <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter des équipements
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
                placeholder="Rechercher ou ajouter..." 
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleKeyDown}
            />
            <CommandList>
                <CommandEmpty>
                    {inputValue ? `Appuyez sur "Entrée" pour ajouter "${inputValue}"` : "Aucun équipement trouvé."}
                </CommandEmpty>
                <CommandGroup>
                {unselectedFeatures.map((feature) => (
                    <CommandItem
                        key={feature}
                        value={feature}
                        onSelect={() => {
                            toggleFeature(feature);
                            setOpen(false);
                        }}
                    >
                    {feature}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
}
