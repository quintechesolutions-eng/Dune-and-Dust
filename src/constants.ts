import { Bird, Palmtree, Mountain, Sun } from 'lucide-react';

export const APP_NAME = "DUNE & DUST";

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const NAMIBIA_REGIONS = [
  { id: 'north', name: 'Northern Wildlife', desc: 'Etosha, Damaraland, Caprivi Strip', icon: Bird, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'coast', name: 'Skeleton Coast', desc: 'Swakopmund, Walvis Bay, Skeleton Coast Park', icon: Palmtree, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', image: 'https://images.unsplash.com/photo-1520188740392-672bef2247fb?auto=format&fit=crop&w=1200&q=80' },
  { id: 'central', name: 'Central Highlands', desc: 'Windhoek, Waterberg, Erongo', icon: Mountain, color: 'bg-stone-200 text-stone-800 border-stone-300', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80' },
  { id: 'south', name: 'Deep South', desc: 'Sossusvlei, Namib-Naukluft, Fish River', icon: Sun, color: 'bg-orange-100 text-orange-800 border-orange-300', image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80' },
];

export const DIETARY_OPTIONS = [
  'None (Omnivore)', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 
  'Nut Allergy', 'Shellfish Allergy', 'Halal', 'Kosher', 'Keto / Low-Carb', 'Diabetic Friendly', 'FODMAP',
  'Paleo', 'Soy-Free', 'Egg-Free'
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
  { region: 'north', category: 'Wildlife', label: 'Elephant Safari in Caprivi Strip' },
  { region: 'north', category: 'Wildlife', label: 'Bird Watching at Mahango Core Area' },
  { region: 'north', category: 'Wildlife', label: 'Lion Tracking in Palmwag Concession' },
  { region: 'north', category: 'Wildlife', label: 'Hippo & Crocodile spotting in Bwabwata' },
  { region: 'north', category: 'Culture', label: 'Authentic Himba Village Visit (Kunene)' },
  { region: 'north', category: 'Culture', label: 'San Bushmen Guided Walk' },
  { region: 'north', category: 'Culture', label: 'Oshiwambo Homestead Cultural Tour' },
  { region: 'north', category: 'Culture', label: 'Living Museum of the Mafwe' },
  { region: 'north', category: 'Adventure', label: 'Ruacana Falls Exploration' },
  { region: 'north', category: 'Adventure', label: 'Zambezi River Canoe Expedition' },
  { region: 'north', category: 'Adventure', label: 'Popa Falls White-Water Rafting' },
  { region: 'north', category: 'Adventure', label: '4x4 Trail Navigation in the Kaokoveld' },
  { region: 'north', category: 'Photography', label: 'Epupa Falls Sunrise Photography' },
  { region: 'north', category: 'Photography', label: 'Baobab Tree Silhouette Night Shoots' },
  // COAST
  { region: 'coast', category: 'Wildlife', label: 'Cape Cross Seal Reserve' },
  { region: 'coast', category: 'Wildlife', label: 'Walvis Bay Flamingo & Pelican Cruise' },
  { region: 'coast', category: 'Wildlife', label: 'Marine Big 5 Catarman Tour' },
  { region: 'coast', category: 'Wildlife', label: 'Living Desert Tour (Little 5 Tracking)' },
  { region: 'coast', category: 'Wildlife', label: 'Birding at Sandwich Harbour Lagoon' },
  { region: 'coast', category: 'Adventure', label: 'Sandboarding in Swakopmund Dunes' },
  { region: 'coast', category: 'Adventure', label: 'Skeleton Coast Shipwreck 4x4 Tour' },
  { region: 'coast', category: 'Adventure', label: 'Quad Biking the Namib Dunes' },
  { region: 'coast', category: 'Adventure', label: 'Skydiving over the Namib Desert' },
  { region: 'coast', category: 'Adventure', label: 'Kite Surfing at Walvis Bay Lagoon' },
  { region: 'coast', category: 'Adventure', label: 'Deep Sea Fishing Expedition' },
  { region: 'coast', category: 'Relaxation', label: 'Swakopmund German Bakery Tour & Coffee' },
  { region: 'coast', category: 'Relaxation', label: 'Catamaran Sunset Cruise' },
  { region: 'coast', category: 'History', label: 'Swakopmund Architecture Walking Tour' },
  { region: 'coast', category: 'History', label: 'Cape Inscription (Diego Cão cross) Visit' },
  // CENTRAL
  { region: 'central', category: 'Hiking', label: 'Waterberg Plateau Guided Hike' },
  { region: 'central', category: 'Hiking', label: 'Daan Viljoen Game Reserve Trails' },
  { region: 'central', category: 'Hiking', label: 'Bulls Party & Elephant Head Bouldering (Erongo)' },
  { region: 'central', category: 'Culture', label: 'Windhoek Katutura Township Tour' },
  { region: 'central', category: 'Culture', label: 'Craft Market Shopping in Okahandja' },
  { region: 'central', category: 'Culture', label: 'Penduka Village Handicraft Workshop' },
  { region: 'central', category: 'History', label: 'Twyfelfontein Ancient Rock Engravings' },
  { region: 'central', category: 'History', label: 'Christuskirche & Independence Museum' },
  { region: 'central', category: 'History', label: 'Petrified Forest Guided Tour' },
  { region: 'central', category: 'History', label: 'Omaruru Artist Trail & Wineries' },
  { region: 'central', category: 'Adventure', label: 'Spitzkoppe Bouldering & Stargazing' },
  { region: 'central', category: 'Adventure', label: 'Brandberg Mountain (White Lady) Hike' },
  { region: 'central', category: 'Wildlife', label: 'Okonjima Leopard Tracking' },
  { region: 'central', category: 'Wildlife', label: 'Naankuse Wildlife Sanctuary Volunteering' },
  { region: 'central', category: 'Relaxation', label: 'Erongo Mountain Sunset Sundowners' },
  // SOUTH
  { region: 'south', category: 'Landscapes', label: 'Climbing Dune 45 at Sunrise' },
  { region: 'south', category: 'Landscapes', label: 'Deadvlei Dead Trees Photography' },
  { region: 'south', category: 'Landscapes', label: 'Scenic Flight over Sossusvlei' },
  { region: 'south', category: 'Landscapes', label: 'NamibRand Nature Reserve Dark Sky Stargazing' },
  { region: 'south', category: 'Landscapes', label: 'Sossusvlei Pan exploration' },
  { region: 'south', category: 'Hiking', label: 'Fish River Canyon Multi-day Hike' },
  { region: 'south', category: 'Hiking', label: 'Sesriem Canyon Exploration' },
  { region: 'south', category: 'Hiking', label: 'Olive Trail in Namib-Naukluft' },
  { region: 'south', category: 'Hiking', label: 'Waterkloof Trail endurance hike' },
  { region: 'south', category: 'Photography', label: 'Quiver Tree Forest Astrophotography' },
  { region: 'south', category: 'Photography', label: 'Giants Playground Rock Formations' },
  { region: 'south', category: 'History', label: 'Kolmanskop Abandoned Diamond Ghost Town' },
  { region: 'south', category: 'History', label: 'Lüderitz Diaz Point & Architecture Walk' },
  { region: 'south', category: 'History', label: 'Duwisib Castle Desert Oasis Visit' },
  { region: 'south', category: 'Wildlife', label: 'Wild Horses of the Namib (Aus)' },
  { region: 'south', category: 'Wildlife', label: 'Kalahari Red Dune Meerkat Encounters' },
  { region: 'south', category: 'Adventure', label: 'Hot Air Ballooning over the Namib' },
  { region: 'south', category: 'Adventure', label: 'Kayaking in Lüderitz Bay' }
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

export const VEHICLE_OPTIONS = [
  { id: 'heavy_4x4', name: 'Heavy-Duty 4x4 SUV (Expedition Equipped)', drivetain: '4x4', fuel: 'Diesel', desc: 'The gold standard for African expeditions. Rooftop tent capable.' },
  { id: 'standard_4x4', name: 'Standard 4x4 SUV', drivetain: '4x4', fuel: 'Diesel/Petrol', desc: 'Reliable and comfortable for all Namibian gravel and mild off-road.' },
  { id: 'compact_4x4', name: 'Compact 4x4 SUV', drivetain: '4x4', fuel: 'Petrol', desc: 'Small but mighty, perfect for two explorers negotiating tighter trails.' },
  { id: 'hybrid_4x4', name: 'Hybrid 4x4 SUV', drivetain: '4WD', fuel: 'Hybrid (Petrol/Electric)', desc: 'Excellent fuel economy on long hauls, capable on gravel.' },
  { id: 'campervan', name: '4x4 Expedition Campervan', drivetain: '4x4', fuel: 'Diesel', desc: 'Fully integrated living space for maximum self-sufficiency.' },
  { id: 'ev_safari', name: 'Fully Electric Safari Vehicle', drivetain: '4WD', fuel: 'Electric', desc: 'Silent tracking, requires specialized and carefully planned charging stops.' },
  { id: 'rugged_awd', name: 'Rugged AWD Crossover', drivetain: 'AWD', fuel: 'Petrol', desc: 'Suitable for main arterial routes and the Swakopmund corridor.' }
];
