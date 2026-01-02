
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

async function getApiAuthToken(): Promise<string | null> {
  if (authToken && authTokenExpires && Date.now() < authTokenExpires) {
    return authToken;
  }

  const API_TOKEN = process.env.CAR_API_TOKEN || 'aa77f496-739d-429c-bb49-90e0644607cd';
  const API_SECRET = process.env.CAR_API_SECRET || '3d27f6316acd408c116f788fbdfd256d';

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
      console.error(`CarAPI Auth Error (${response.status})`);
      return null;
    }

    const tokenData = await response.json();
    authToken = tokenData.token;
    authTokenExpires = Date.now() + (tokenData.expires_in - 300) * 1000;
    return authToken;
  } catch (error) {
    console.error("Exception during CarAPI authentication:", error);
    return null;
  }
}

async function fetchFromApi(endpoint: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`CarAPI Error (${response.status}) fetching ${url}`);
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
      throw new Error("Invalid data structure from CarAPI");
    }
    
    return z.array(MakeSchema.passthrough()).parse(makesData.data);
  } catch (error) {
    console.error('Error in getMakes, falling back to backup list:', error);
    // FALLBACK to a local list if API fails
    return [
        { id: 1, name: 'Audi' },
        { id: 2, name: 'BMW' },
        { id: 3, name: 'Mercedes-Benz' },
        { id: 4, name: 'Volkswagen' },
        { id: 5, name: 'Porsche' },
        { id: 6, name: 'Ford' },
        { id: 7, name: 'Toyota' },
        { id: 8, name: 'Honda' },
        { id: 9, name: 'Nissan' },
        { id: 10, name: 'Hyundai' },
        { id: 11, name: 'Kia' },
        { id: 12, name: 'Peugeot' },
        { id: 13, name: 'Renault' },
        { id: 14, name: 'Citroën' },
        { id: 15, name: 'Fiat' },
        { id: 16, name: 'Opel' },
        { id: 17, name: 'Skoda' },
        { id: 18, name: 'Seat' },
        { id: 19, name: 'Volvo' },
        { id: 20, name: 'Tesla' },
    ].sort((a,b) => a.name.localeCompare(b.name));
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
     
     return z.array(ModelSchema.passthrough()).parse(modelsData.data);
   } catch(error) {
      console.error('Error in getModels:', error);
      return [];
   }
}
