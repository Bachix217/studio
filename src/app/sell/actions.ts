'use server';

import { z } from 'zod';

// Schémas de validation Zod simplifiés et robustes
const MakeSchema = z.object({
  id: z.number(),
  name: z.string(),
});
const ModelSchema = z.object({
  id: z.number(),
  name: z.string(),
  make_id: z.number(),
});

export type Make = z.infer<typeof MakeSchema>;
export type Model = z.infer<typeof ModelSchema>;

const API_BASE_URL = 'https://carapi.app/api';

// Variables pour stocker le jeton et sa date d'expiration en mémoire du serveur
let authToken: string | null = null;
let authTokenExpires: number | null = null;

/**
 * Gère l'authentification avec CarAPI.
 * Demande un nouveau jeton uniquement si nécessaire (manquant ou expiré).
 */
async function getApiAuthToken(): Promise<string | null> {
  // Vérifie si le jeton actuel est toujours valide (valide pendant 30 minutes)
  if (authToken && authTokenExpires && Date.now() < authTokenExpires) {
    return authToken;
  }

  console.log("Authenticating with CarAPI...");

  const API_TOKEN = 'aa77f496-739d-429c-bb49-90e0644607cd';
  const API_SECRET = '3d27f6316acd408c116f788fbdfd256d';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: API_TOKEN,
        api_secret: API_SECRET,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`CarAPI Auth Error (${response.status}): ${errorBody}`);
      // Réinitialise les variables en cas d'erreur
      authToken = null;
      authTokenExpires = null;
      return null;
    }

    const tokenData = await response.json();
    
    // Stocke le nouveau jeton et sa date d'expiration
    authToken = tokenData.token;
    // Le jeton est valide 60 minutes, on le rafraîchit après 55 minutes pour être sûr
    authTokenExpires = Date.now() + (tokenData.expires_in - 300) * 1000; 
    
    console.log("CarAPI authentication successful.");
    return authToken;
  } catch (error) {
    console.error("Exception during CarAPI authentication:", error);
    authToken = null;
    authTokenExpires = null;
    return null;
  }
}

/**
 * Fonction interne pour effectuer les appels authentifiés à l'API.
 */
async function fetchFromApi(endpoint: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`, // Utilise le jeton JWT
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`CarAPI Error (${response.status}) fetching ${url}: ${errorBody}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`General error in fetchFromApi for ${endpoint}:`, error);
    return null;
  }
}


export async function getMakes(): Promise<Make[]> {
  try {
    const token = await getApiAuthToken();
    if (!token) {
        throw new Error("Failed to get API token.");
    }
    
    const makesData = await fetchFromApi('makes', token, { sort: 'name', direction: 'asc' });

    if (!makesData || !Array.isArray(makesData.data)) {
      console.error('getMakes did not receive a valid data array:', makesData);
      return [];
    }
    
    // Valide les données avec Zod, mais ne bloque pas si des champs supplémentaires existent
    return z.array(MakeSchema.passthrough()).parse(makesData.data);
  } catch (error) {
    console.error('Error in getMakes:', error);
    return [];
  }
}

export async function getModels(makeId: number): Promise<Model[]> {
   if (!makeId) return [];
   try {
     const token = await getApiAuthToken();
     if (!token) {
        throw new Error("Failed to get API token.");
     }

     const modelsData = await fetchFromApi('models', token, { year: '2024', make_id: String(makeId), sort: 'name', direction: 'asc' });
     
     if (!modelsData || !Array.isArray(modelsData.data)) {
        console.error('getModels did not receive a valid data array:', modelsData);
        return [];
     }
     
     // Valide les données avec Zod
     return z.array(ModelSchema.passthrough()).parse(modelsData.data);
   } catch(error) {
      console.error('Error in getModels:', error);
      return [];
   }
}
