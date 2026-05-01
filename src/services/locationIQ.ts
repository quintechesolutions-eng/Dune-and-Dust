import axios from 'axios';

const API_KEY = (import.meta as any).env.VITE_LOCATION_IQ_API_KEY || 'pk.3fd0a0ae7669c99a748712da6ebf7c4e';
const BASE_URL = 'https://us1.locationiq.com/v1';

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export const searchLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await axios.get(`${BASE_URL}/search.php`, {
      params: {
        key: API_KEY,
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        normalizecity: 1,
        countrycodes: 'na',
        viewbox: '11.0,-29.0,26.0,-16.0',
        bounded: 1
      }
    });

    return response.data;
  } catch (error) {
    console.error('LocationIQ Search Error:', error);
    return [];
  }
};

export const autocompleteLocations = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await axios.get(`${BASE_URL}/autocomplete.php`, {
      params: {
        key: API_KEY,
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'na',
        viewbox: '11.0,-29.0,26.0,-16.0',
        bounded: 1
      }
    });

    return response.data;
  } catch (error) {
    console.error('LocationIQ Autocomplete Error:', error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<LocationSuggestion | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/reverse.php`, {
      params: {
        key: API_KEY,
        lat,
        lon,
        format: 'json',
        addressdetails: 1
      }
    });

    return response.data;
  } catch (error) {
    console.error('LocationIQ Reverse Geocode Error:', error);
    return null;
  }
};
