import { Bird, Palmtree, Mountain, Sun, Waves, MapPin, Tent } from 'lucide-react';

export const APP_NAME = "DUNE & DUST";

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const NAMIBIA_REGIONS = [
  { id: 'etosha', name: 'Etosha National Park', desc: 'Premier wildlife viewing around massive salt pans', icon: Bird, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'damaraland', name: 'Damaraland', desc: 'Desert-adapted elephants, rhinos, and ancient rock art', icon: Mountain, color: 'bg-orange-100 text-orange-800 border-orange-300', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80' },
  { id: 'skeleton_coast', name: 'Skeleton Coast', desc: 'Shipwrecks, roaring dunes, and desolate shorelines', icon: Waves, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', image: 'https://images.unsplash.com/photo-1520188740392-672bef2247fb?auto=format&fit=crop&w=1200&q=80' },
  { id: 'swakopmund', name: 'Swakopmund & Walvis Bay', desc: 'Adventure capital, flamingos, and colonial charm', icon: Palmtree, color: 'bg-blue-100 text-blue-800 border-blue-300', image: 'https://images.unsplash.com/photo-1620959086708-3729e2402e1b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'sossusvlei', name: 'Sossusvlei & Deadvlei', desc: 'Towering red dunes and iconic dead tree valleys', icon: Sun, color: 'bg-red-100 text-red-800 border-red-300', image: 'https://images.unsplash.com/photo-1506558235281-28dc12eaec5a?auto=format&fit=crop&w=1200&q=80' },
  { id: 'fish_river', name: 'Fish River Canyon', desc: 'The second largest canyon in the world', icon: MapPin, color: 'bg-amber-100 text-amber-800 border-amber-300', image: 'https://images.unsplash.com/photo-1515281239448-2abee61db1d7?auto=format&fit=crop&w=1200&q=80' },
  { id: 'caprivi', name: 'Zambezi Region (Caprivi)', desc: 'Lush wetlands, hippos, crocodiles and river safaris', icon: Tent, color: 'bg-green-100 text-green-800 border-green-300', image: 'https://images.unsplash.com/photo-1521651475513-e45eb97a1599?auto=format&fit=crop&w=1200&q=80' },
  { id: 'kalahari', name: 'Kalahari Desert', desc: 'Red sands, meerkats, and Bushman culture', icon: Sun, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', image: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?auto=format&fit=crop&w=1200&q=80' },
  { id: 'namib_rand', name: 'NamibRand Nature Reserve', desc: 'Dark sky reserves, fairy circles, and expansive plains', icon: Sun, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80' },
  { id: 'kunene', name: 'Kunene & Epupa Falls', desc: 'Remote waterfalls and Himba tribal culture', icon: Waves, color: 'bg-blue-100 text-blue-800 border-blue-300', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80' },
  { id: 'waterberg', name: 'Waterberg Plateau', desc: 'Table mountain landscape and rare rhino conservation', icon: Mountain, color: 'bg-orange-100 text-orange-800 border-orange-300', image: 'https://images.unsplash.com/photo-1616823395982-1e967a92fb4a?auto=format&fit=crop&w=1200&q=80' },
  { id: 'khaudum', name: 'Khaudum National Park', desc: 'True wilderness, deep sand 4x4 trails, and huge elephant herds', icon: Mountain, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80' },
  { id: 'luderitz', name: 'Lüderitz & Kolmanskop', desc: 'Ghost towns buried in sand and rugged windy coasts', icon: Palmtree, color: 'bg-cyan-100 text-cyan-800 border-cyan-300', image: 'https://images.unsplash.com/photo-1627918451834-c2edccfc4eb4?auto=format&fit=crop&w=1200&q=80' }
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

export const STARTING_LOCATIONS = [
  'Windhoek (Hosea Kutako International Airport)',
  'Windhoek (City Center)',
  'Swakopmund',
  'Walvis Bay (Airport)',
  'Katima Mulilo (Caprivi)',
  'Rundu',
  'Keetmanshoop',
  'Lüderitz',
  'Ondangwa'
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

export const INTERESTS_CATALOG = [
  // ETOSHA
  { region: 'etosha', category: 'Wildlife', label: 'Self-Drive Safari in Etosha Pan' },
  { region: 'etosha', category: 'Wildlife', label: 'Guided Night Game Drive' },
  { region: 'etosha', category: 'Photography', label: 'Waterhole Photography at Sunset' },
  { region: 'etosha', category: 'Wildlife', label: 'Black Rhino Spotting at Okaukuejo' },

  // DAMARALAND
  { region: 'damaraland', category: 'Wildlife', label: 'Tracking Free-Roaming Desert Rhinos' },
  { region: 'damaraland', category: 'Wildlife', label: 'Desert-Adapted Elephant Tracking' },
  { region: 'damaraland', category: 'Culture', label: 'Twyfelfontein Rock Engravings Tour' },
  { region: 'damaraland', category: 'Culture', label: 'Living Museum of the Damara' },
  { region: 'damaraland', category: 'Adventure', label: 'Hiking the Spitzkoppe (Matterhorn of Namibia)' },

  // SKELETON COAST
  { region: 'skeleton_coast', category: 'Wildlife', label: 'Cape Cross Seal Reserve' },
  { region: 'skeleton_coast', category: 'Adventure', label: 'Shipwreck 4x4 Exploration' },
  { region: 'skeleton_coast', category: 'Photography', label: 'Desolate Landscape Photography' },

  // SWAKOPMUND & WALVIS BAY
  { region: 'swakopmund', category: 'Wildlife', label: 'Walvis Bay Flamingo & Pelican Cruise' },
  { region: 'swakopmund', category: 'Wildlife', label: 'Living Desert Tour (Little 5 Tracking)' },
  { region: 'swakopmund', category: 'Adventure', label: 'Sandboarding the Namib Dunes' },
  { region: 'swakopmund', category: 'Adventure', label: 'Quad Biking through the Desert' },
  { region: 'swakopmund', category: 'Adventure', label: 'Skydiving over the Namib' },
  { region: 'swakopmund', category: 'Relaxation', label: 'Swakopmund German Bakery Tour' },

  // SOSSUSVLEI
  { region: 'sossusvlei', category: 'Adventure', label: 'Climbing Dune 45 at Sunrise' },
  { region: 'sossusvlei', category: 'Photography', label: 'Deadvlei Ancient Trees Photography' },
  { region: 'sossusvlei', category: 'Adventure', label: 'Big Daddy Dune Hike' },
  { region: 'sossusvlei', category: 'Romance', label: 'Hot Air Balloon Flight over the Namib' },
  { region: 'sossusvlei', category: 'Nature', label: 'Sesriem Canyon Walk' },

  // FISH RIVER CANYON
  { region: 'fish_river', category: 'Adventure', label: 'Multi-day Fish River Canyon Hike' },
  { region: 'fish_river', category: 'Nature', label: 'Canyon Viewpoint Sundowners' },
  { region: 'fish_river', category: 'Relaxation', label: 'Ai-Ais Hot Springs Soak' },

  // CAPRIVI (Zambezi)
  { region: 'caprivi', category: 'Wildlife', label: 'Zambezi River Hippo & Croc Safari' },
  { region: 'caprivi', category: 'Wildlife', label: 'Birding in Bwabwata National Park' },
  { region: 'caprivi', category: 'Adventure', label: 'Mokoro (Dugout Canoe) Trip' },
  { region: 'caprivi', category: 'Fishing', label: 'Tiger Fishing Expedition' },

  // KALAHARI
  { region: 'kalahari', category: 'Culture', label: 'San Bushmen Guided Walk' },
  { region: 'kalahari', category: 'Wildlife', label: 'Meerkat Encounter' },
  { region: 'kalahari', category: 'Nature', label: 'Red Dune Sundowner Drive' },

  // NAMIB RAND
  { region: 'namib_rand', category: 'Action', label: 'Fat Bike Dune Cycling' },
  { region: 'namib_rand', category: 'Nature', label: 'Dark Sky Stargazing Safari' },
  { region: 'namib_rand', category: 'Nature', label: 'Fairy Circle Guided Tour' },

  // KUNENE / EPUPA
  { region: 'kunene', category: 'Culture', label: 'Himba Village Authentic Visit' },
  { region: 'kunene', category: 'Nature', label: 'Epupa Falls Hike' },
  { region: 'kunene', category: 'Adventure', label: 'White Water Rafting (Seasonal)' },

  // WATERBERG
  { region: 'waterberg', category: 'Wildlife', label: 'Rare Rhino Tracking' },
  { region: 'waterberg', category: 'Adventure', label: 'Plateau Multi-Day Hike' },
  { region: 'waterberg', category: 'History', label: 'Herero War Battle Sites' },

  // KHAUDUM
  { region: 'khaudum', category: 'Adventure', label: 'Deep Sand 4x4 Expedition' },
  { region: 'khaudum', category: 'Wildlife', label: 'Wild Dog Spotting' },

  // LUDERITZ
  { region: 'luderitz', category: 'Photography', label: 'Kolmanskop Ghost Town Tour' },
  { region: 'luderitz', category: 'Nature', label: 'Diaz Point & Penguin Island' },
  { region: 'luderitz', category: 'Culture', label: 'Oyster Tasting & Harbor Tour' }
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
  { id: 'heavy_4x4', name: 'Heavy-Duty 4x4 SUV (Expedition Equipped)', drivetain: '4x4', fuel: 'Diesel', desc: 'The gold standard for African expeditions. Rooftop tent capable.', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80' },
  { id: 'standard_4x4', name: 'Standard 4x4 SUV', drivetain: '4x4', fuel: 'Diesel/Petrol', desc: 'Reliable and comfortable for all Namibian gravel and mild off-road.', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80' },
  { id: 'compact_4x4', name: 'Compact 4x4 SUV', drivetain: '4x4', fuel: 'Petrol', desc: 'Small but mighty, perfect for two explorers negotiating tighter trails.', image: 'https://images.unsplash.com/photo-1559404287-dc1945f85022?auto=format&fit=crop&w=800&q=80' },
  { id: 'hybrid_4x4', name: 'Hybrid 4x4 SUV', drivetain: '4WD', fuel: 'Hybrid (Petrol/Electric)', desc: 'Excellent fuel economy on long hauls, capable on gravel.', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80' },
  { id: 'campervan', name: '4x4 Expedition Campervan', drivetain: '4x4', fuel: 'Diesel', desc: 'Fully integrated living space for maximum self-sufficiency.', image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80' },
  { id: 'ev_safari', name: 'Fully Electric Safari Vehicle', drivetain: '4WD', fuel: 'Electric', desc: 'Silent tracking, requires specialized and carefully planned charging stops.', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80' },
  { id: 'rugged_awd', name: 'Rugged AWD Crossover', drivetain: 'AWD', fuel: 'Petrol', desc: 'Suitable for main arterial routes and the Swakopmund corridor.', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80' },
  { id: 'small_hatchback', name: 'Small 2x4 Hatchback', drivetain: '2WD', fuel: 'Petrol', desc: 'Budget-friendly. Limited to tarred major roads and well-graded C roads only.', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80' }
];
