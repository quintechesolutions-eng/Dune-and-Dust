import axios from 'axios';

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export const getOSRMRoute = async (points: { lat: number, lng: number }[]): Promise<RouteGeometry | null> => {
  if (points.length < 2) return null;

  const coordinatesStr = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesStr}?overview=full&geometries=geojson`;

  try {
    const response = await axios.get(url);
    if (response.data.code === 'Ok' && response.data.routes.length > 0) {
      return response.data.routes[0].geometry;
    }
    return null;
  } catch (error) {
    console.error("OSRM Routing Error:", error);
    return null;
  }
};
