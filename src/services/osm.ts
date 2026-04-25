import axios from 'axios';

export interface OSMPlace {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    tourism?: string;
    "addr:street"?: string;
    website?: string;
    description?: string;
    rating?: string; // OSM rarely has ratings, but some tags might exist
  };
}

export const getNearbyOSMPlaces = async (
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<OSMPlace[]> => {
  const query = `
    [out:json];
    (
      node["amenity"~"restaurant|cafe|fuel|pub"](around:${radius},${lat},${lng});
      node["tourism"~"viewpoint|hotel|camp_site|guest_house"](around:${radius},${lat},${lng});
      way["amenity"~"restaurant|cafe|fuel|pub"](around:${radius},${lat},${lng});
      way["tourism"~"viewpoint|hotel|camp_site|guest_house"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: query.trim() }
    });

    return response.data.elements.map((el: any) => ({
      id: el.id,
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      tags: el.tags || {}
    })) as OSMPlace[];
  } catch (error) {
    console.error("Overpass API Error:", error);
    return [];
  }
};
