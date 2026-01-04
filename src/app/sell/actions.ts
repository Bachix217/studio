
'use server';

import 'dotenv/config';

// --- Types (inchangés pour la compatibilité avec le front-end) ---
export type Make = {
  id: string;
  name: string;
};
export type Model = {
  id: string;
  name: string;
};


// --- Logique CarAPI ---

const API_BASE_URL = 'https://carapi.app/api';
let jwtToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Récupère un jeton JWT pour CarAPI, le met en cache et le renouvelle si nécessaire.
 */
async function getCarApiToken(): Promise<string> {
  const now = Date.now();
  // Renouveler le jeton s'il expire dans la prochaine minute (60000 ms)
  if (jwtToken && tokenExpiry && now < tokenExpiry - 60000) {
    return jwtToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        api_token: process.env.CARAPI_TOKEN,
        api_secret: process.env.CARAPI_SECRET,
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`CarAPI Authentication failed. Status: ${response.status}. Body: ${errorBody}`);
        throw new Error(`CarAPI Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    jwtToken = data.token;
    // Le jeton expire en 24h (86400 secondes), on le stocke en millisecondes
    tokenExpiry = now + (24 * 60 * 60 * 1000); 

    if (!jwtToken) {
        throw new Error("No token received from CarAPI");
    }

    return jwtToken;
  } catch (error) {
    console.error('Error getting CarAPI token:', error);
    // Réinitialiser le token en cas d'erreur pour forcer une nouvelle tentative
    jwtToken = null;
    tokenExpiry = null;
    throw error; // Propage l'erreur pour que l'appelant puisse la gérer
  }
}

/**
 * Fonction générique pour effectuer des requêtes à CarAPI avec gestion du token.
 */
async function fetchCarApi(endpoint: string, options: RequestInit = {}, forceRetry = true): Promise<any> {
    const token = await getCarApiToken();

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        // La revalidation toutes les 24 heures est une bonne pratique pour les données qui changent peu.
        next: { revalidate: 60 * 60 * 24 } 
    });

    if (response.status === 401 && forceRetry) {
        // Le token a probablement expiré, on le force à se renouveler et on réessaie une fois.
        console.log('CarAPI token may have expired, renewing...');
        jwtToken = null; 
        tokenExpiry = null;
        return fetchCarApi(endpoint, options, false); // forceRetry = false pour éviter une boucle infinie
    }

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`CarAPI request failed for ${endpoint}. Status: ${response.status}. Body: ${errorBody}`);
        throw new Error(`CarAPI request failed for ${endpoint}: ${response.statusText}`);
    }

    return response.json();
}


/**
 * Récupère la liste de toutes les marques de véhicules depuis CarAPI.
 */
export async function getMakes(): Promise<Make[]> {
  try {
    const data = await fetchCarApi('makes?sort=name');
    
    if (!data.data || !Array.isArray(data.data)) {
        console.error("Format de réponse inattendu de CarAPI pour les marques:", data);
        throw new Error("Format de réponse inattendu de CarAPI pour les marques.");
    }
    
    // Transformation des données pour correspondre à notre type `Make`
    const makes = data.data.map((make: { id: number; name: string }) => ({
      id: String(make.id),
      name: make.name,
    }));
    
    // L'API trie déjà, mais on peut s'en assurer
    return makes;

  } catch (error) {
    console.error('Error fetching makes from CarAPI:', error);
    return [];
  }
}

/**
 * Récupère les modèles pour un ID de marque donné.
 */
export async function getModels(makeId: string): Promise<Model[]> {
   if (!makeId) return [];

   try {
     const filter = JSON.stringify([{ "field": "make_id", "op": "=", "val": makeId }]);
     const data = await fetchCarApi(`models?sort=name&json=${encodeURIComponent(filter)}`);

     if (!data.data || !Array.isArray(data.data)) {
        console.error(`Format de réponse inattendu pour les modèles de la marque ID ${makeId}:`, data);
        throw new Error("Format de réponse inattendu de CarAPI pour les modèles.");
     }
     
     // Transformation des données
     const models = data.data.map((model: { id: number; name: string }) => ({
        id: String(model.id),
        name: model.name,
     }));

     return models;

   } catch(error) {
      console.error(`Error fetching models for make ID ${makeId}:`, error);
      return [];
   }
}
