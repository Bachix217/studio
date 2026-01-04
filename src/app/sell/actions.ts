
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

  console.log('Requesting new CarAPI token...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain', // Important, l'API renvoie du texte brut
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

    // L'API renvoie le token en texte brut, pas en JSON.
    const token = await response.text();
    jwtToken = token;
    
    // Décode le payload pour obtenir la date d'expiration
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedPayload);
        // exp est en secondes, on le convertit en millisecondes
        if (payload.exp) {
          tokenExpiry = payload.exp * 1000;
          console.log(`New token expires at: ${new Date(tokenExpiry).toLocaleString()}`);
        }
    } catch(e) {
        console.error('Failed to decode JWT payload:', e);
        // On met une expiration par défaut (ex: 24h) si le décodage échoue
        tokenExpiry = now + (24 * 60 * 60 * 1000);
    }
    
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
    const data = await fetchCarApi('makes?sort=name');
    
    if (!data.data || !Array.isArray(data.data)) {
        console.error("Format de réponse inattendu de CarAPI pour les marques:", data);
        throw new Error("Format de réponse inattendu de CarAPI pour les marques.");
    }
    
    const makes = data.data.map((make: { id: number; name: string }) => ({
      id: String(make.id),
      name: make.name,
    }));
    
    return makes;
}

/**
 * Récupère les modèles pour un NOM de marque donné.
 */
export async function getModels(makeName: string): Promise<Model[]> {
   console.log(`[Debug Modèles] Début de getModels avec makeName: ${makeName}`);
   if (!makeName) return [];

   try {
     const filter = JSON.stringify([{ "field": "make", "op": "=", "val": makeName }]);
     const data = await fetchCarApi(`models?sort=name&json=${encodeURIComponent(filter)}`);
     console.log(`[Debug Modèles] Réponse brute de l'API pour makeName ${makeName}:`, data);

     if (!data.data || !Array.isArray(data.data)) {
        console.error(`Format de réponse inattendu pour les modèles de la marque ${makeName}:`, data);
        return [];
     }
     
     // Transformation des données
     const models = data.data.map((model: { id: number; name: string }) => ({
        id: String(model.id),
        name: model.name,
     }));

     return models;

   } catch(error) {
      console.error(`Error fetching models for make name ${makeName}:`, error);
      throw error; // Propage l'erreur
   }
}

    
