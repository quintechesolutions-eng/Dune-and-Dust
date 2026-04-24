import { Bird, Palmtree, Mountain, Sun, Waves, MapPin, Tent } from 'lucide-react';
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
  { id: 'luxury_lodge', name: 'Luxury Safari Lodges', image: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=800&q=80', desc: 'Premium services, fine dining, and guided drives.' },
  { id: 'guest_farm', name: 'Private Guest Farms', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80', desc: 'Authentic Namibian farm stays with home-cooked meals.' },
  { id: 'airbnb_self_catering', name: 'Airbnb & Self-Catering', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', desc: 'Independent villas, townhouses, or remote cabins.' },
  { id: 'glamping', name: 'Boutique Glamping', image: 'https://images.unsplash.com/photo-1504280390227-361cffbcceed?auto=format&fit=crop&w=800&q=80', desc: 'Canvas tents with en-suite bathrooms and real beds.' },
  { id: 'rooftop_camping', name: 'Rooftop Tents / Camping', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80', desc: 'Rugged freedom under the stars with your 4x4.' }
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
  { id: 'heavy_4x4', name: 'Heavy-Duty Expedition 4x4 (e.g. Land Cruiser 79)', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 14, desc: 'The gold standard for African expeditions. Invincible on any terrain.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: 'standard_4x4', name: 'Standard 4x4 SUV (e.g. Toyota Fortuner)', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 10, desc: 'Reliable, comfortable, handles all Namibian gravel roads.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { id: 'compact_4x4', name: 'Compact 4x4 (e.g. Suzuki Jimny)', drivetain: '4x4', fuel: 'Petrol', fuelL100km: 8, desc: 'Small but mighty, great fuel economy on lighter trails.', image: 'https://images.unsplash.com/photo-1559404287-dc1945f85022?auto=format&fit=crop&w=800&q=80' },
  { id: 'luxury_suv', name: 'Luxury 4x4 SUV (e.g. Range Rover Sport)', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 12, desc: 'Premium comfort meets serious off-road capability.', image: 'https://images.unsplash.com/photo-1606611013014-0b949a64e2f6?auto=format&fit=crop&w=800&q=80' },
  { id: 'hilux_double', name: 'Double Cab Bakkie (e.g. Toyota Hilux)', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 11, desc: 'Load bed for gear, rooftop tent ready, Namibia\'s workhorse.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80' },
  { id: 'campervan', name: '4x4 Camper Motorhome', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 18, desc: 'Fully integrated living space for maximum self-sufficiency.', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80' },
  { id: 'rooftop_4x4', name: '4x4 with Rooftop Tent (e.g. Hilux + RTT)', drivetain: '4x4', fuel: 'Diesel', fuelL100km: 12, desc: 'The classic overlander setup. Sleep anywhere, explore everything.', image: 'https://images.unsplash.com/photo-1504280390227-361cffbcceed?auto=format&fit=crop&w=800&q=80' },
  { id: 'rugged_awd', name: 'AWD Crossover (e.g. Subaru Outback)', drivetain: 'AWD', fuel: 'Petrol', fuelL100km: 8, desc: 'Great on graded gravel, excellent fuel economy.', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80' },
  { id: 'minivan', name: 'Minivan / People Carrier (e.g. VW Caravelle)', drivetain: '2WD', fuel: 'Diesel', fuelL100km: 9, desc: 'Space for 6-8 passengers. Tarred roads and light gravel only.', image: 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=800&q=80' },
  { id: 'small_hatchback', name: 'Small Hatchback/Sedan (e.g. VW Polo)', drivetain: '2WD', fuel: 'Petrol', fuelL100km: 6, desc: 'Budget-friendly. Strictly limited to tarred major roads.', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' },
  { id: 'motorcycle', name: 'Adventure Motorcycle (e.g. BMW GS 1250)', drivetain: '2WD', fuel: 'Petrol', fuelL100km: 5, desc: 'For solo riders. Extreme freedom but requires experience.', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' },
  { id: 'ev_suv', name: 'Electric SUV (e.g. Tesla Model Y)', drivetain: 'AWD', fuel: 'Electric', fuelL100km: 0, desc: 'Limited to major corridors with charging. Not recommended for remote routes.', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80' },
];
export const getTripImage = (title: string = '', location: string = '') => {
  const text = (title + ' ' + location).toLowerCase();
  
  if (text.includes('etosha') || text.includes('wildlife') || text.includes('safari') || text.includes('animal')) {
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'; // Etosha/Wildlife
  }
  if (text.includes('sossusvlei') || text.includes('dune') || text.includes('desert') || text.includes('deadvlei') || text.includes('namib')) {
    return 'https://images.unsplash.com/photo-1520113412646-04fc68c0bc21?auto=format&fit=crop&w=1200&q=80'; // Dunes
  }
  if (text.includes('swakopmund') || text.includes('walvis') || text.includes('coast') || text.includes('ocean') || text.includes('sea')) {
    return 'https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=1200&q=80'; // Coast
  }
  if (text.includes('skeleton') || text.includes('shipwreck') || text.includes('desolate')) {
    return 'https://images.unsplash.com/photo-1544474673-98485293297a?auto=format&fit=crop&w=1200&q=80'; // Skeleton Coast
  }
  if (text.includes('damaraland') || text.includes('rock') || text.includes('mountain') || text.includes('twyfelfontein')) {
    return 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80'; // Damaraland
  }
  if (text.includes('fish river') || text.includes('canyon') || text.includes('gorge')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'; // Canyon
  }
  if (text.includes('windhoek') || text.includes('city') || text.includes('urban')) {
    return 'https://images.unsplash.com/photo-1517409228833-c90a18bb7201?auto=format&fit=crop&w=1200&q=80'; // Windhoek
  }
  if (text.includes('caprivi') || text.includes('zambezi') || text.includes('river') || text.includes('water')) {
    return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'; // Caprivi
  }
  if (text.includes('luderitz') || text.includes('kolmanskop') || text.includes('ghost')) {
    return 'https://images.unsplash.com/photo-1544474673-98485293297a?auto=format&fit=crop&w=1200&q=80'; // Kolmanskop
  }
  
  // Default Scenic Namibia
  return 'https://images.unsplash.com/photo-1504280390227-361cffbcceed?auto=format&fit=crop&w=1200&q=80';
};
