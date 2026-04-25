import axios from 'axios';

const FOURSQUARE_API_KEY = (import.meta.env.VITE_FOURSQUARE_API_KEY || '').trim();

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  location: {
    address?: string;
    cross_street?: string;
    formatted_address?: string;
  };
  categories: Array<{ name: string }>;
  rating?: number;
  stats?: {
    total_ratings?: number;
  };
  description?: string;
  tel?: string;
  website?: string;
}

/**
 * Categories:
 * 13000: Dining and Drinking
 * 10000: Arts and Entertainment
 * 16000: Landmarks and Outdoors
 */
export const getNearbyPlaces = async (
  lat: number,
  lng: number,
  categories: string = '13000,10000',
  limit: number = 5
): Promise<FoursquarePlace[]> => {
  if (!FOURSQUARE_API_KEY) {
    console.warn("Foursquare API key missing. Skipping enrichment.");
    return [];
  }

  try {
    const response = await axios.get('https://api.foursquare.com/v3/places/search', {
      params: {
        ll: `${lat},${lng}`,
        categories: categories,
        sort: 'RATING',
        limit: limit,
        fields: 'fsq_id,name,location,categories,rating,stats,description,tel,website'
      },
      headers: {
        Authorization: FOURSQUARE_API_KEY,
        Accept: 'application/json'
      }
    });

    return response.data.results as FoursquarePlace[];
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("Foursquare API Error: Unauthorized (401). Ensure your API key starts with 'fsq3_' and is a valid v3 Places API Key.");
    } else {
      console.error("Foursquare API Error:", error);
    }
    return [];
  }
};
