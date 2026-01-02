
'use server';

import { z } from 'zod';

// Schéma pour les marques de CarQueryAPI
const MakeSchema = z.object({
  make_id: z.string(),
  make_display: z.string(),
});

// Schéma pour les modèles de CarQueryAPI
const ModelSchema = z.object({
  model_name: z.string(),
});

export type Make = {
  id: string;
  name: string;
};
export type Model = {
    id: string; // Using name as id for simplicity
    name: string;
};

const API_BASE_URL = 'http://www.carqueryapi.com/api/0.3/?cmd=';

/**
 * Récupère la liste de toutes les marques de véhicules depuis l'API CarQuery.
 */
export async function getMakes(): Promise<Make[]> {
  try {
    const response = await fetch(`${API_BASE_URL}getMakes`, {
        // La revalidation toutes les 24 heures est une bonne pratique pour les données qui changent peu.
        next: { revalidate: 60 * 60 * 24 } 
    });

    if (!response.ok) {
      throw new Error(`CarQueryAPI Error: ${response.status}`);
    }

    const data = await response.json();

    // CarQueryAPI retourne { Makes: [...] }
    if (!data.Makes || !Array.isArray(data.Makes)) {
        throw new Error("Format de réponse inattendu de l'API pour les marques.");
    }
    
    // Transformation des données pour correspondre à notre type `Make`
    const makes = data.Makes.map((make: { make_id: string; make_display: string }) => ({
      id: make.make_id,
      name: make.make_display,
    }));
    
    // Tri alphabétique pour l'affichage
    return makes.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Error fetching makes from CarQueryAPI:', error);
    // En cas d'erreur, retourner une liste vide pour ne pas faire planter l'application.
    return [];
  }
}

/**
 * Récupère les modèles pour une marque donnée en utilisant le nom de la marque.
 */
export async function getModels(makeId: string): Promise<Model[]> {
   if (!makeId) return [];

   try {
     const response = await fetch(`${API_BASE_URL}getModels&make=${makeId}`, {
        next: { revalidate: 60 * 60 * 24 }
     });

     if (!response.ok) {
        throw new Error(`CarQueryAPI Error for models: ${response.status}`);
     }

     const data = await response.json();

     if (!data.Models || !Array.isArray(data.Models)) {
        throw new Error("Format de réponse inattendu de l'API pour les modèles.");
     }
     
     // Transformation des données
     const models = data.Models.map((model: { model_name: string }) => ({
        id: model.model_name, // CarQueryAPI ne fournit pas d'ID de modèle, nous utilisons le nom
        name: model.model_name,
     }));

     return models.sort((a,b) => a.name.localeCompare(b.name));

   } catch(error) {
      console.error(`Error fetching models for makeId ${makeId}:`, error);
      return [];
   }
}
