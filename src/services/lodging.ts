export interface LodgingOption {
  name: string;
  region: string;
  type: 'Luxury' | 'Mid-range' | 'Budget' | 'Camping';
  priceRange: { min: number; max: number };
  currency: string;
  rating: number;
  features: string[];
}

export const LODGING_DATA: LodgingOption[] = [
  // WINDHOEK
  {
    name: 'Hilton Windhoek',
    region: 'Windhoek',
    type: 'Luxury',
    priceRange: { min: 2500, max: 4500 },
    currency: 'NAD',
    rating: 4.5,
    features: ['Rooftop Pool', 'City Center', 'Gym', 'High Speed WiFi']
  },
  {
    name: 'Galton House',
    region: 'Windhoek',
    type: 'Mid-range',
    priceRange: { min: 1800, max: 2800 },
    currency: 'NAD',
    rating: 4.8,
    features: ['Boutique', 'Quiet Neighborhood', 'Gourmet Breakfast', 'Personalized Service']
  },
  {
    name: 'Arebbusch Travel Lodge',
    region: 'Windhoek',
    type: 'Budget',
    priceRange: { min: 850, max: 1500 },
    currency: 'NAD',
    rating: 4.2,
    features: ['Family Friendly', 'Restaurant', 'Pool', 'Self-catering options']
  },
  {
    name: 'Urban Camp',
    region: 'Windhoek',
    type: 'Camping',
    priceRange: { min: 250, max: 600 },
    currency: 'NAD',
    rating: 4.6,
    features: ['Central Location', 'Garden Atmosphere', 'Bar', 'Glamping Tents']
  },

  // SWAKOPMUND
  {
    name: 'Strand Hotel Swakopmund',
    region: 'Swakopmund',
    type: 'Luxury',
    priceRange: { min: 3500, max: 6000 },
    currency: 'NAD',
    rating: 4.7,
    features: ['Ocean Front', 'Multiple Restaurants', 'Spa', 'Historic Location']
  },
  {
    name: 'Pelican Point Lodge',
    region: 'Swakopmund',
    type: 'Luxury',
    priceRange: { min: 8000, max: 12000 },
    currency: 'NAD',
    rating: 4.9,
    features: ['Remote Peninsula', 'Seal Colony', 'Lighthouse View', 'All-inclusive']
  },
  {
    name: 'Swakopmund Guesthouse',
    region: 'Swakopmund',
    type: 'Mid-range',
    priceRange: { min: 1500, max: 2500 },
    currency: 'NAD',
    rating: 4.6,
    features: ['Eco-friendly', 'Near Beach', 'Modern Design']
  },
  {
    name: 'Hotel A La Mer',
    region: 'Swakopmund',
    type: 'Budget',
    priceRange: { min: 900, max: 1600 },
    currency: 'NAD',
    rating: 4.1,
    features: ['Sea Views', 'Central', 'Friendly Staff']
  },

  // ETOSHA
  {
    name: 'Onguma The Fort',
    region: 'Etosha',
    type: 'Luxury',
    priceRange: { min: 7000, max: 15000 },
    currency: 'NAD',
    rating: 4.9,
    features: ['Moroccan Style', 'Private Deck', 'Overlooking Waterhole', 'Sunset Views']
  },
  {
    name: 'Mushara Bush Camp',
    region: 'Etosha',
    type: 'Mid-range',
    priceRange: { min: 3000, max: 5000 },
    currency: 'NAD',
    rating: 4.7,
    features: ['Tented Luxury', 'Family Friendly', 'Thatch Roof', 'Guided Game Drives']
  },
  {
    name: 'Okaukuejo Rest Camp',
    region: 'Etosha',
    type: 'Mid-range',
    priceRange: { min: 2000, max: 4000 },
    currency: 'NAD',
    rating: 4.3,
    features: ['Floodlit Waterhole', 'Inside Park', 'Wildlife Proximity', 'Historic']
  },
  {
    name: 'Etosha Safari Camp',
    region: 'Etosha',
    type: 'Budget',
    priceRange: { min: 1200, max: 2200 },
    currency: 'NAD',
    rating: 4.4,
    features: ['Shebeen Style Bar', 'Live Music', 'Close to Anderson Gate']
  },

  // SOSSUSVLEI / SESRIEM
  {
    name: '&Beyond Sossusvlei Desert Lodge',
    region: 'Sossusvlei',
    type: 'Luxury',
    priceRange: { min: 12000, max: 25000 },
    currency: 'NAD',
    rating: 5.0,
    features: ['Stargazing Observatory', 'Private Plunge Pool', 'Silent Desert', 'Luxury Design']
  },
  {
    name: 'Little Kulala',
    region: 'Sossusvlei',
    type: 'Luxury',
    priceRange: { min: 9000, max: 18000 },
    currency: 'NAD',
    rating: 4.9,
    features: ['Private Park Entrance', 'Star Beds', 'Dune Access']
  },
  {
    name: 'Sossusvlei Lodge',
    region: 'Sossusvlei',
    type: 'Mid-range',
    priceRange: { min: 3500, max: 6000 },
    currency: 'NAD',
    rating: 4.6,
    features: ['At the Gate', 'Buffet Dinner', 'Desert Views']
  },
  {
    name: 'Desert Quiver Camp',
    region: 'Sossusvlei',
    type: 'Budget',
    priceRange: { min: 1800, max: 3000 },
    currency: 'NAD',
    rating: 4.5,
    features: ['Self-catering', 'Modern Pods', 'Swimming Pool']
  },
  {
    name: 'Sesriem Campsite',
    region: 'Sossusvlei',
    type: 'Camping',
    priceRange: { min: 400, max: 800 },
    currency: 'NAD',
    rating: 4.2,
    features: ['Inside the Gate', 'Early Dune Access', 'Communal Facilities']
  },

  // DAMARALAND
  {
    name: 'Mowani Mountain Camp',
    region: 'Damaraland',
    type: 'Luxury',
    priceRange: { min: 6000, max: 10000 },
    currency: 'NAD',
    rating: 4.8,
    features: ['Boulder Integration', 'Desert Elephant Tracking', 'Ancient Landscapes']
  },
  {
    name: 'Madisa Camp',
    region: 'Damaraland',
    type: 'Budget',
    priceRange: { min: 300, max: 1200 },
    currency: 'NAD',
    rating: 4.4,
    features: ['Rock Formations', 'Star Lit Showers', 'Elephant Corridor']
  },

  // LUDERITZ
  {
    name: 'Luderitz Nest Hotel',
    region: 'Luderitz',
    type: 'Mid-range',
    priceRange: { min: 1800, max: 3200 },
    currency: 'NAD',
    rating: 4.3,
    features: ['Sea Front', 'Private Jetty', 'Kolmanskop Tours']
  },
  {
    name: 'Shark Island Campsite',
    region: 'Luderitz',
    type: 'Camping',
    priceRange: { min: 250, max: 500 },
    currency: 'NAD',
    rating: 4.0,
    features: ['Ocean Views', 'Rugged Coastline', 'Historic Site']
  }
];
