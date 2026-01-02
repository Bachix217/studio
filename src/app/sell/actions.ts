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

async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
  const API_TOKEN = process.env.CAR_API_TOKEN; 
  const API_SECRET = process.env.CAR_API_SECRET;

  if (!API_TOKEN || !API_SECRET) {
    throw new Error('CarAPI credentials are not set in environment variables.');
  }

  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'X-API-KEY': API_TOKEN, 
        'Accept': 'application/json',
      },
       cache: 'no-store'
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error (${response.status}) fetching ${url.toString()}: ${errorBody}`);
      throw new Error(`Failed to fetch from CarAPI endpoint: ${endpoint}. Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`Error fetching from ${url.toString()}:`, error);
    throw error;
  }
}

export async function getMakes(): Promise<Make[]> {
  const makesData = await fetchFromApi('makes', { sort: 'name', direction: 'asc' });
  const parsed = z.array(MakeSchema).safeParse(makesData.data);
  if (!parsed.success) {
      console.error('Failed to parse makes:', parsed.error);
      return [];
  }
  return parsed.data;
}

export async function getModels(makeId: number): Promise<Model[]> {
   if (!makeId) return [];
   const modelsData = await fetchFromApi('models', { year: '2024', make_id: String(makeId), sort: 'name', direction: 'asc' });
   const parsed = z.array(ModelSchema).safeParse(modelsData.data);
   if (!parsed.success) {
      console.error(`Failed to parse models for makeId ${makeId}:`, parsed.error);
      return [];
  }
  return parsed.data;
}
