'use server';

import { z } from 'zod';

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
let authToken: string | null = null;
let authTokenExpires: number | null = null;

async function getApiAuthToken(): Promise<string> {
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
            throw new Error('Failed to authenticate with CarAPI.');
        }

        const tokenData = await response.json();
        
        authToken = tokenData.token;
        authTokenExpires = Date.now() + (tokenData.expires_in - 300) * 1000;
        
        console.log("CarAPI authentication successful.");
        return authToken as string;
    } catch (error) {
        console.error("Exception during CarAPI authentication:", error);
        throw error;
    }
}

async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
    try {
        const token = await getApiAuthToken();
        const url = new URL(`${API_BASE_URL}/${endpoint}`);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`, // Utiliser le jeton JWT ici
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`CarAPI Error (${response.status}) fetching ${url}: ${errorBody}`);
            throw new Error(`Failed to fetch from CarAPI endpoint: ${endpoint}. Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`General error in fetchFromApi for ${endpoint}:`, error);
        return null;
    }
}

export async function getMakes(): Promise<Make[]> {
  try {
    const makesData = await fetchFromApi('makes', { sort: 'name', direction: 'asc' });
    if (!makesData || !Array.isArray(makesData.data)) {
      console.error('getMakes did not receive a valid data array:', makesData);
      return [];
    }
    return makesData.data;
  } catch (error) {
    console.error('Error in getMakes:', error);
    return [];
  }
}

export async function getModels(makeId: number): Promise<Model[]> {
   if (!makeId) return [];
   try {
     const modelsData = await fetchFromApi('models', { year: '2024', make_id: String(makeId), sort: 'name', direction: 'asc' });
     if (!modelsData || !Array.isArray(modelsData.data)) {
        console.error('getModels did not receive a valid data array:', modelsData);
        return [];
     }
     return modelsData.data;
   } catch(error) {
      console.error('Error in getModels:', error);
      return [];
   }
}
