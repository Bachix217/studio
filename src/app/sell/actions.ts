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
let apiToken: string | null = null;

async function getApiAuthToken(): Promise<string> {
    const API_TOKEN = 'aa77f496-739d-429c-bb49-90e0644607cd';
    const API_SECRET = '3d27f6316acd408c116f788fbdfd256d';

    if (!API_TOKEN || !API_SECRET) {
        throw new Error('CarAPI credentials are not set.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_token: API_TOKEN,
            api_secret: API_SECRET,
        }),
        cache: 'no-store',
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Auth Error (${response.status}): ${errorBody}`);
        throw new Error('Failed to authenticate with CarAPI.');
    }
    
    // The response body is the token itself
    const token = await response.text();
    return token;
}


async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
  try {
    if (!apiToken) {
        apiToken = await getApiAuthToken();
    }

    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      },
       cache: 'no-store'
    });

    if (!response.ok) {
      // If token is expired, try to re-authenticate
      if (response.status === 401) {
        apiToken = await getApiAuthToken();
        return fetchFromApi(endpoint, params);
      }
      const errorBody = await response.text();
      console.error(`API Error (${response.status}) fetching ${url.toString()}: ${errorBody}`);
      throw new Error(`Failed to fetch from CarAPI endpoint: ${endpoint}. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Error in fetchFromApi for ${endpoint}:`, error);
    throw error;
  }
}

export async function getMakes(): Promise<Make[]> {
  const makesData = await fetchFromApi('makes', { sort: 'name', direction: 'asc' });
  return makesData as Make[];
}

export async function getModels(makeId: number): Promise<Model[]> {
   if (!makeId) return [];
   // CarAPI uses 'make_id' for models, not 'makeId'
   const modelsData = await fetchFromApi('models', { year: '2024', make_id: String(makeId), sort: 'name', direction: 'asc' });
   return modelsData as Model[];
}
