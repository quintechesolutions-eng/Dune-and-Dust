import { Bird, Palmtree, Mountain, Sun, Waves, MapPin, Tent, Camera, Users, Heart } from 'lucide-react';
import { ACTIVITIES_DATA } from './activities-data';

export const APP_NAME = "DUNE & DUST";

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const NAMIBIA_REGIONS = [
  { id: 'etosha', name: 'Etosha National Park', lat: -18.8556, lng: 16.3293, desc: 'Premier wildlife viewing around massive salt pans', icon: Bird, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', gradient: 'from-emerald-900 to-emerald-600' },
  { id: 'damaraland', name: 'Damaraland', lat: -20.8038, lng: 14.9452, desc: 'Desert-adapted elephants, rhinos, and ancient rock art', icon: Mountain, color: 'bg-orange-100 text-orange-800 border-orange-300', gradient: 'from-orange-900 to-amber-600' },
  { id: 'skeleton_coast', name: 'Skeleton Coast', lat: -19.2290, lng: 12.7087, desc: 'Shipwrecks, roaring dunes, and desolate shorelines', icon: Waves, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', gradient: 'from-slate-900 to-cyan-700' },
  { id: 'swakopmund', name: 'Swakopmund & Walvis Bay', lat: -22.6792, lng: 14.5272, desc: 'Adventure capital, flamingos, and colonial charm', icon: Palmtree, color: 'bg-blue-100 text-blue-800 border-blue-300', gradient: 'from-sky-900 to-blue-500' },
  { id: 'sossusvlei', name: 'Sossusvlei & Deadvlei', lat: -24.7275, lng: 15.3307, desc: 'Towering red dunes and iconic dead tree valleys', icon: Sun, color: 'bg-red-100 text-red-800 border-red-300', gradient: 'from-red-900 to-orange-500' },
  { id: 'fish_river', name: 'Fish River Canyon', lat: -27.6049, lng: 17.6053, desc: 'The second largest canyon in the world', icon: MapPin, color: 'bg-amber-100 text-amber-800 border-amber-300', gradient: 'from-stone-900 to-amber-700' },
  { id: 'caprivi', name: 'Zambezi Region (Caprivi)', lat: -17.8920, lng: 23.5186, desc: 'Lush wetlands, hippos, crocodiles and river safaris', icon: Tent, color: 'bg-green-100 text-green-800 border-green-300', gradient: 'from-green-900 to-emerald-600' },
  { id: 'kalahari', name: 'Kalahari Desert', lat: -24.8480, lng: 18.0691, desc: 'Red sands, meerkats, and Bushman culture', icon: Sun, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', gradient: 'from-amber-900 to-yellow-600' },
  { id: 'namib_rand', name: 'NamibRand Nature Reserve', lat: -25.1090, lng: 15.9390, desc: 'Dark sky reserves, fairy circles, and expansive plains', icon: Sun, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', gradient: 'from-indigo-900 to-purple-800' },
  { id: 'kunene', name: 'Kunene & Epupa Falls', lat: -17.0016, lng: 13.2452, desc: 'Remote waterfalls and Himba tribal culture', icon: Waves, color: 'bg-blue-100 text-blue-800 border-blue-300', gradient: 'from-cyan-900 to-teal-500' },
  { id: 'waterberg', name: 'Waterberg Plateau', lat: -20.4501, lng: 17.2471, desc: 'Table mountain landscape and rare rhino conservation', icon: Mountain, color: 'bg-orange-100 text-orange-800 border-orange-300', gradient: 'from-rose-900 to-orange-700' },
  { id: 'khaudum', name: 'Khaudum National Park', lat: -18.8471, lng: 20.7302, desc: 'True wilderness, deep sand 4x4 trails, and huge elephant herds', icon: Mountain, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', gradient: 'from-stone-800 to-yellow-700' },
  { id: 'luderitz', name: 'Lüderitz & Kolmanskop', lat: -26.6473, lng: 15.1581, desc: 'Ghost towns buried in sand and rugged windy coasts', icon: Palmtree, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', gradient: 'from-gray-900 to-slate-500' }
];

export const DETAIL_LEVELS = [
  { id: 'brief', name: 'Executive Summary', desc: 'Just the highlights, driving times, and lodges.' },
  { id: 'standard', name: 'Standard Itinerary', desc: 'Balanced view with daily activities and meal tips.' },
  { id: 'insane', name: 'Insane Deep-Dive', desc: 'Minute-by-minute scheduling, extensive history, exact packing.' }
];

export const ACCOMMODATION_STYLES = [
  { id: 'luxury_lodge', name: 'Luxury Safari Lodges', image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=800&q=80', desc: 'Premium services, fine dining, and guided drives.' },
  { id: 'guest_farm', name: 'Private Guest Farms', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', desc: 'Authentic Namibian farm stays with home-cooked meals.' },
  { id: 'airbnb_self_catering', name: 'Airbnb & Self-Catering', image: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=800&q=80', desc: 'Independent villas, townhouses, or remote cabins.' },
  { id: 'glamping', name: 'Boutique Glamping', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80', desc: 'Canvas tents with en-suite bathrooms and real beds.' },
  { id: 'rooftop_camping', name: 'Rooftop Tents / Camping', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', desc: 'Rugged freedom under the stars with your 4x4.' }
];

export const BUDGET_OPTIONS = [
  { id: 'ultra_shoestring', label: 'Ultra-Shoestring (Hitchhiking & Wild Camping)', image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80' },
  { id: 'budget', label: 'Budget (Campsites & Backpackers)', image: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?auto=format&fit=crop&w=400&q=80' },
  { id: 'mid_range', label: 'Mid-Range (Standard Lodges, B&Bs, Glamping)', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80' },
  { id: 'upper_mid', label: 'Upper Mid-Range (Boutique Lodges & Private Reserves)', image: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=400&q=80' },
  { id: 'luxury', label: 'Luxury (Premium Lodges, Fully Catered)', image: 'https://images.unsplash.com/photo-1540541338-8d7ffceceb51?auto=format&fit=crop&w=400&q=80' },
  { id: 'ultra_luxury', label: 'Ultra-Luxury (Fly-in Safari, Exclusive Use Camps)', image: 'https://images.unsplash.com/photo-1542314831-c6a4d14effca?auto=format&fit=crop&w=400&q=80' }
];

export const PACE_OPTIONS = [
  { id: 'sloth', label: 'Sloth (Multiple nights per location, zero stress)', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80' },
  { id: 'relaxed', label: 'Relaxed (2-3 nights per stop, leisurely mornings)', image: 'https://images.unsplash.com/photo-1534444589201-9f9b5c3258fa?auto=format&fit=crop&w=400&q=80' },
  { id: 'moderate', label: 'Moderate (The standard balance of driving and doing)', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80' },
  { id: 'fast', label: 'Fast (Early mornings, long drives, seeing it all)', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=400&q=80' },
  { id: 'insane', label: 'Insane (Dawn till dusk driving, maximum coverage)', image: 'https://images.unsplash.com/photo-1522881113591-b0e6df297298?auto=format&fit=crop&w=400&q=80' }
];

export const TRIP_MOODS = [
  { id: 'adventure', name: 'High Adventure', icon: Mountain, desc: 'Active, rugged, and adrenaline-pumping.' },
  { id: 'relaxation', name: 'Relaxation & Spa', icon: Sun, desc: 'Slow-paced, luxurious, and peaceful.' },
  { id: 'wildlife', name: 'Wildlife Focus', icon: Bird, desc: 'Maximum time spent on safaris and nature.' },
  { id: 'photography', name: 'Photography', icon: Camera, desc: 'Optimized for the best light and iconic views.' },
  { id: 'cultural', name: 'Cultural Immersion', icon: Users, desc: 'Focus on local communities and history.' },
  { id: 'romantic', name: 'Romantic / Honeymoon', icon: Heart, desc: 'Private, scenic, and intimate settings.' }
];

// Expanded Interests Catalog
export const INTERESTS_CATALOG = ACTIVITIES_DATA;

export const LOADING_FACTS = [
  "Cross-referencing your car's fuel capacity with Namibian petrol stations...",
  "Alerting the lodges about your preferences...",
  "Calculating gravel road driving speeds for your exact vehicle...",
  "Fact: The Namib Desert is over 55 million years old.",
  "Checking sunrise times for the perfect Deadvlei photo...",
  "Fact: Namibia has the largest free-roaming cheetah population.",
  "Ensuring the itinerary matches the ages of your travelers...",
  "Generating an immersive, minute-by-minute breakdown..."
];
export const VEHICLE_OPTIONS = [
  // Eco & Hybrid
  { id: 'hybrid_cross', category: 'eco_hybrid', name: 'Eco Crossover', model: 'Toyota Corolla Cross Hybrid', drivetrain: 'FWD', transmission: 'automatic', isHybrid: true, fuel: 'Petrol/Electric', fuelL100km: 4.3, maxPassengers: 5, maxLargeBags: 2, maxSmallBags: 3, desc: 'Ultra-efficient, smooth on tar and well-graded gravel.', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=80' },
  { id: 'hybrid_suv', category: 'eco_hybrid', name: 'Premium Hybrid SUV', model: 'Toyota RAV4 Hybrid', drivetrain: 'AWD', transmission: 'automatic', isHybrid: true, fuel: 'Petrol/Electric', fuelL100km: 4.8, maxPassengers: 5, maxLargeBags: 3, maxSmallBags: 4, desc: 'The perfect balance of efficiency and Namibian capability.', image: 'https://images.unsplash.com/photo-1566473065146-d206f3984722?auto=format&fit=crop&w=800&q=80' },
  
  // Rugged 4x4
  { id: 'heavy_4x4', category: 'rugged_4x4', name: 'Heavy-Duty Expedition 4x4', model: 'Land Cruiser 79', drivetrain: '4x4', transmission: 'manual', fuel: 'Diesel', fuelL100km: 14, maxPassengers: 5, maxLargeBags: 6, maxSmallBags: 4, desc: 'The gold standard for African expeditions. Invincible.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: 'standard_4x4', category: 'rugged_4x4', name: 'Standard 4x4 SUV', model: 'Toyota Fortuner', drivetrain: '4x4', transmission: 'automatic', fuel: 'Diesel', fuelL100km: 9.5, maxPassengers: 7, maxLargeBags: 4, maxSmallBags: 3, desc: 'Reliable, comfortable, handles all Namibian gravel roads.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { id: 'hilux_double', category: 'rugged_4x4', name: 'Double Cab Bakkie', model: 'Toyota Hilux', drivetrain: '4x4', transmission: 'automatic', fuel: 'Diesel', fuelL100km: 10.5, maxPassengers: 5, maxLargeBags: 5, maxSmallBags: 5, desc: 'Load bed for gear, rooftop tent ready, Namibia\'s workhorse.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80' },
  { id: 'jimny', category: 'rugged_4x4', name: 'Compact 4x4', model: 'Suzuki Jimny', drivetrain: '4x4', transmission: 'automatic', fuel: 'Petrol', fuelL100km: 7.5, maxPassengers: 4, maxLargeBags: 1, maxSmallBags: 2, desc: 'Small but mighty. Perfect for couples on a budget.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },

  // Group Travel
  { id: 'minivan', category: 'group_travel', name: 'Luxury Minivan', model: 'VW Caravelle', drivetrain: 'FWD', transmission: 'automatic', fuel: 'Diesel', fuelL100km: 8.5, maxPassengers: 8, maxLargeBags: 5, maxSmallBags: 6, desc: 'Premium group comfort for long distance tar travel.', image: 'https://images.unsplash.com/photo-1554672408-730436b60dde?auto=format&fit=crop&w=800&q=80' },
  { id: 'sprinter', category: 'group_travel', name: 'Touring Bus', model: 'Mercedes Sprinter', drivetrain: 'RWD', transmission: 'manual', fuel: 'Diesel', fuelL100km: 12, maxPassengers: 14, maxLargeBags: 10, maxSmallBags: 14, desc: 'Large group expeditions with professional drivers.', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },

  // Public & Specialty
  { id: 'adv_motorcycle', category: 'specialty', name: 'Adventure Motorcycle', model: 'BMW R1250GS', drivetrain: '2WD', transmission: 'manual', fuel: 'Petrol', fuelL100km: 5, maxPassengers: 1, maxLargeBags: 0, maxSmallBags: 2, desc: 'Solo freedom on gravel paths.', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
  { id: 'byo_4x4', category: 'specialty', name: 'Bring Your Own (BYO)', model: 'Custom 4x4', drivetrain: '4x4', transmission: 'automatic', fuel: 'Any', fuelL100km: 12, maxPassengers: 5, maxLargeBags: 8, maxSmallBags: 8, desc: 'Planning a trip with your own specialized vehicle.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
];

export const LANDSCAPE_IMAGES = [
  'https://images.unsplash.com/photo-1520113412646-04fc68c0bc21?auto=format&fit=crop&w=1200&q=80', // Sossusvlei
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', // Wildlife
  'https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=1200&q=80', // Coast
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80', // Damaraland
  'https://images.unsplash.com/photo-1544474673-98485293297a?auto=format&fit=crop&w=1200&q=80', // Skeleton Coast
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80', // Caprivi
  'https://images.unsplash.com/photo-1542314831-c6a4d14effca?auto=format&fit=crop&w=1200&q=80', // Luxury Lodge
  'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1200&q=80', // Mountains
];

export const getTripImage = (title: string = '', location: string = '', index: number = 0) => {
  const normalizedLoc = (location || title || '').toLowerCase();
  
  // High-fidelity keyword mapping for Namibia
  let searchTerms = 'namibia,landscape';
  if (normalizedLoc.includes('etosha')) searchTerms = 'namibia,wildlife,safari,lion,elephant';
  else if (normalizedLoc.includes('sossusvlei') || normalizedLoc.includes('deadvlei') || normalizedLoc.includes('sesriem')) searchTerms = 'namibia,dunes,sossusvlei,red,sand';
  else if (normalizedLoc.includes('swakopmund') || normalizedLoc.includes('walvis')) searchTerms = 'namibia,coast,ocean,flamingos';
  else if (normalizedLoc.includes('skeleton')) searchTerms = 'namibia,skeleton,coast,shipwreck';
  else if (normalizedLoc.includes('damaraland') || normalizedLoc.includes('twyfelfontein')) searchTerms = 'namibia,rocks,mountains,elephant';
  else if (normalizedLoc.includes('fish river')) searchTerms = 'namibia,canyon,river';
  else if (normalizedLoc.includes('caprivi') || normalizedLoc.includes('zambezi')) searchTerms = 'namibia,wetlands,river,hippo';
  else if (normalizedLoc.includes('luderitz') || normalizedLoc.includes('kolmanskop')) searchTerms = 'namibia,ghost,town,sand,luderitz';
  else if (normalizedLoc.includes('windhoek')) searchTerms = 'namibia,city,windhoek,architecture';
  else if (normalizedLoc.includes('kalahari')) searchTerms = 'namibia,kalahari,red,sand';

  // LoremFlickr with the improved search terms
  return `https://loremflickr.com/1200/800/${searchTerms}/all?lock=${index + 100}`;
};
