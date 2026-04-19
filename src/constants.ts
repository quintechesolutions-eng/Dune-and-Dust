import { Bird, Palmtree, Mountain, Sun } from 'lucide-react';

export const APP_NAME = "DUNE & DUST";

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const NAMIBIA_REGIONS = [
  { id: 'north', name: 'Northern Wildlife', desc: 'Etosha, Damaraland, Caprivi Strip', icon: Bird, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', image: 'https://images.unsplash.com/photo-1520188740392-672bef2247fb?auto=format&fit=crop&w=800&q=80' },
  { id: 'coast', name: 'Skeleton Coast', desc: 'Swakopmund, Walvis Bay, Skeleton Coast Park', icon: Palmtree, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', image: 'https://images.unsplash.com/photo-1504218861250-74e8de174f85?auto=format&fit=crop&w=800&q=80' },
  { id: 'central', name: 'Central Highlands', desc: 'Windhoek, Waterberg, Erongo', icon: Mountain, color: 'bg-stone-200 text-stone-800 border-stone-300', image: 'https://images.unsplash.com/photo-1481464904474-a575a33b44a0?auto=format&fit=crop&w=800&q=80' },
  { id: 'south', name: 'Deep South', desc: 'Sossusvlei, Namib-Naukluft, Fish River', icon: Sun, color: 'bg-orange-100 text-orange-800 border-orange-300', image: 'https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=800&q=80' },
];

export const DIETARY_OPTIONS = [
  'None (Omnivore)', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 
  'Nut Allergy', 'Shellfish Allergy', 'Halal', 'Kosher', 'Keto / Low-Carb', 'Diabetic Friendly', 'FODMAP'
];

export const DETAIL_LEVELS = [
  { id: 'brief', name: 'Executive Summary', desc: 'Just the highlights, driving times, and lodges.' },
  { id: 'standard', name: 'Standard Itinerary', desc: 'Balanced view with daily activities and meal tips.' },
  { id: 'insane', name: 'Insane Deep-Dive', desc: 'Minute-by-minute scheduling, extensive history, exact packing.' }
];

export const BUDGET_OPTIONS = [
  'Ultra-Shoestring (Hitchhiking & Wild Camping)',
  'Budget (Campsites & Backpackers)',
  'Mid-Range (Standard Lodges, B&Bs, Glamping)',
  'Upper Mid-Range (Boutique Lodges & Private Reserves)',
  'Luxury (Premium Lodges, Fully Catered)',
  'Ultra-Luxury (Fly-in Safari, Exclusive Use Camps)'
];

export const PACE_OPTIONS = [
  'Sloth (Multiple nights per location, zero stress)',
  'Relaxed (2-3 nights per stop, leisurely mornings)',
  'Moderate (The standard balance of driving and doing)',
  'Fast (Early mornings, long drives, seeing it all)',
  'Insane (Dawn till dusk driving, maximum coverage)'
];

export const INTERESTS_CATALOG = [
  // NORTH
  { region: 'north', category: 'Wildlife', label: 'Self-Drive Safari in Etosha Pan' },
  { region: 'north', category: 'Wildlife', label: 'Tracking Free-Roaming Desert Rhinos' },
  { region: 'north', category: 'Wildlife', label: 'Cheetah Conservation Encounters' },
  { region: 'north', category: 'Culture', label: 'Authentic Himba Village Visit (Kunene)' },
  { region: 'north', category: 'Adventure', label: 'Ruacana Falls Exploration' },
  { region: 'north', category: 'Photography', label: 'Epupa Falls Sunrise Photography' },
  // COAST
  { region: 'coast', category: 'Wildlife', label: 'Cape Cross Seal Reserve' },
  { region: 'coast', category: 'Wildlife', label: 'Walvis Bay Flamingo & Pelican Cruise' },
  { region: 'coast', category: 'Adventure', label: 'Sandboarding in Swakopmund Dunes' },
  { region: 'coast', category: 'Adventure', label: 'Skeleton Coast Shipwreck 4x4 Tour' },
  { region: 'coast', category: 'Adventure', label: 'Quad Biking the Namib Dunes' },
  { region: 'coast', category: 'Relaxation', label: 'Swakopmund German Bakery Tour & Coffee' },
  // CENTRAL
  { region: 'central', category: 'Hiking', label: 'Waterberg Plateau Guided Hike' },
  { region: 'central', category: 'Culture', label: 'Windhoek Katutura Township Tour' },
  { region: 'central', category: 'History', label: 'Twyfelfontein Ancient Rock Engravings' },
  { region: 'central', category: 'Adventure', label: 'Spitzkoppe Bouldering & Stargazing' },
  { region: 'central', category: 'Wildlife', label: 'Okonjima Leopard Tracking' },
  { region: 'central', category: 'Relaxation', label: 'Erongo Mountain Sunset Sundowners' },
  // SOUTH
  { region: 'south', category: 'Landscapes', label: 'Climbing Dune 45 at Sunrise' },
  { region: 'south', category: 'Landscapes', label: 'Deadvlei Dead Trees Photography' },
  { region: 'south', category: 'Hiking', label: 'Fish River Canyon Multi-day Hike' },
  { region: 'south', category: 'Hiking', label: 'Sesriem Canyon Exploration' },
  { region: 'south', category: 'Photography', label: 'Quiver Tree Forest Astrophotography' },
  { region: 'south', category: 'History', label: 'Kolmanskop Abandoned Diamond Ghost Town' },
  { region: 'south', category: 'Wildlife', label: 'Wild Horses of the Namib (Aus)' },
];

export const LOADING_FACTS = [
  "Cross-referencing your car's fuel capacity with Namibian petrol stations...",
  "Alerting the lodges about your dietary requirements...",
  "Calculating gravel road driving speeds for your exact vehicle...",
  "Fact: The Namib Desert is over 55 million years old.",
  "Checking sunrise times for the perfect Deadvlei photo...",
  "Fact: Namibia has the largest free-roaming cheetah population.",
  "Ensuring the itinerary matches the ages of your travelers...",
  "Generating an insane, minute-by-minute breakdown..."
];
