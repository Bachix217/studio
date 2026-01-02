
'use server';

import { z } from 'zod';

// Schéma pour les marques de la NHTSA
const MakeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Schéma pour les modèles de la NHTSA
const ModelSchema = z.object({
  id: z.number(),
  name: z.string(),
  make_id: z.number(),
});

export type Make = z.infer<typeof MakeSchema>;
export type Model = z.infer<typeof ModelSchema>;

const API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Récupère la liste de toutes les marques de véhicules depuis l'API NHTSA.
 */
export async function getMakes(): Promise<Make[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/getallmakes?format=json`, {
        // La revalidation toutes les 24 heures est une bonne pratique pour les données qui changent peu.
        next: { revalidate: 60 * 60 * 24 } 
    });

    if (!response.ok) {
      throw new Error(`NHTSA API Error: ${response.status}`);
    }

    const data = await response.json();

    // Transformation des données pour correspondre à notre type `Make`
    const makes = data.Results.map((make: { Make_ID: number; Make_Name: string }) => ({
      id: make.Make_ID,
      name: make.Make_Name,
    }));
    
    // Tri alphabétique pour l'affichage
    return makes.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Error fetching makes from NHTSA API:', error);
    // En cas d'erreur, retourner une liste vide pour ne pas faire planter l'application.
    return [];
  }
}

/**
 * Récupère les modèles pour une marque donnée en utilisant l'ID de la marque.
 */
export async function getModels(makeId: number): Promise<Model[]> {
   if (!makeId) return [];

   try {
     const response = await fetch(`${API_BASE_URL}/GetModelsForMakeId/${makeId}?format=json`, {
        next: { revalidate: 60 * 60 * 24 }
     });

     if (!response.ok) {
        throw new Error(`NHTSA API Error for models: ${response.status}`);
     }

     const data = await response.json();
     
     // Transformation des données
     const models = data.Results.map((model: { Model_ID: number; Model_Name: string, Make_ID: number }) => ({
        id: model.Model_ID,
        name: model.Model_Name,
        make_id: model.Make_ID,
     }));

     return models.sort((a,b) => a.name.localeCompare(b.name));

   } catch(error) {
      console.error(`Error fetching models for makeId ${makeId}:`, error);
      return [];
   }
}
