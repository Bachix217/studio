
'use server';

const API_BASE_URL = 'https://www.carqueryapi.com/api/0.3';

export type Make = {
  id: string;
  name: string;
};

export type Model = {
  name: string;
};

export type Trim = {
    id: number;
    name: string;
    year: number;
    // Add other relevant fields if needed
};


async function fetchCarQuery(params: URLSearchParams) {
  const url = `${API_BASE_URL}/?${params.toString()}`;
  console.log(`Fetching from CarQuery API: ${url}`);
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 * 7 } // Cache for 1 week
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`CarQuery API request failed. Status: ${response.status}. Body: ${errorBody}`);
      throw new Error(`CarQuery API request failed: ${response.statusText}`);
    }
    
    // The API uses JSONP, so we need to clean the response
    let text = await response.text();
    text = text.replace('?([', '[').replace(']);', ']'); // Basic cleaning
    
    return JSON.parse(text);

  } catch (error) {
    console.error('Error fetching from CarQuery API:', error);
    throw error;
  }
}

export async function getMakes(): Promise<Make[]> {
    const params = new URLSearchParams({ cmd: 'getMakes' });
    const data = await fetchCarQuery(params);

    if (!data.Makes || !Array.isArray(data.Makes)) {
        console.error("Unexpected format from CarQuery for makes:", data);
        return [];
    }

    return data.Makes.map((make: { make_id: string; make_display: string }) => ({
        id: make.make_id,
        name: make.make_display,
    }));
}

export async function getModels(makeId: string): Promise<Model[]> {
    if (!makeId) return [];
    const params = new URLSearchParams({ cmd: 'getModels', make: makeId });
    const data = await fetchCarQuery(params);

    if (!data.Models || !Array.isArray(data.Models)) {
        console.error(`Unexpected format from CarQuery for models of make ${makeId}:`, data);
        return [];
    }
    return data.Models.map((model: { model_name: string }) => ({
        name: model.model_name
    }));
}

export async function getTrims(makeId: string, modelName: string): Promise<Trim[]> {
    if (!makeId || !modelName) return [];
    const params = new URLSearchParams({ 
        cmd: 'getTrims', 
        make: makeId,
        model: modelName
    });
    const data = await fetchCarQuery(params);

    if (!data.Trims || !Array.isArray(data.Trims)) {
        console.error(`Unexpected format for trims of ${makeId} ${modelName}:`, data);
        return [];
    }
     return data.Trims.map((trim: any) => ({
        id: trim.model_id,
        name: trim.model_trim,
        year: trim.model_year,
    })).filter((trim: Trim) => trim.name); // Filter out trims with empty names
}
    
