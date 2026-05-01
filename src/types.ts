export interface Traveler {
  id: number;
  name: string;
  age: number;
  hasLicense: boolean;
  budget: number;
}

export interface Vehicle {
  id: string;
  type: 'private' | 'public' | 'guided';
  category: 'adventure' | 'standard' | 'two-wheels' | 'public';
  rentalMode?: 'own' | 'rental';
  make: string;
  model: string;
  drivetrain?: string;
  fuelType?: string;
  fuelConsumptionL100km?: number;
  luggageCapacity: number; // Number of large bags
  ticketCost?: number;
  frequency?: string;
  driverId?: number; // Linked to Traveler.id
}

export interface Logistics {
  days: number;
  month: string;
  startDate?: string;
  endDate?: string;
  mood?: string;
  budget: string;
  budgetPriorities: string[];
  pace: string;
  detailLevel: string;
  startingLocation?: string;
  accommodationStyles: string[];
  specificAccommodation?: string;
  stayStyle?: 'nomadic' | 'basecamp';
}

export interface PickupPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'pickup';
  reason: string;
  order: number;
}

export interface TripConfig {
  selectedRegions: string[];
  travelers: Traveler[];
  vehicles: Vehicle[];
  selectedInterests: string[];
  logistics: Logistics;
  baseCurrency?: string;
  customPickups: PickupPoint[];
}

export interface ItineraryData {
  tripSummary: {
    headline: string;
    overview: string;
    travelerNotes: string;
    totalEstimatedDistanceKm: number;
    climateExpectancy?: string;
    wildlifeExpectancy?: string;
    startingPoint?: {
      location: string;
      latitude: number;
      longitude: number;
    };
  };
  logistics: {
    packingList: string[];
    fuelAdvice: string;
    transportBookingQuery?: string;
    estimatedBudgetTotal: number;
    budgetAllocation: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
    };
  };
  dailyPlan: Array<{
    day: number;
    location: string;
    latitude?: number;
    longitude?: number;
    driveTimeHours: string;
    roadConditions?: string;
    fuelStopRecommendations: string;
    description: string;
    activities: string[];
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
    waypoints?: Array<{
      type: "meal" | "fuel" | "activity";
      name: string;
      latitude: number;
      longitude: number;
    }>;
    accommodation: {
      name: string;
      type: string;
      bookingSearchQuery: string;
      features?: string[];
      listings?: Array<{
        name: string;
        price: number;
        currency: string;
        rating: number;
        recommendationReason: string;
      }>;
      finalRecommendationReason?: string;
    };
  }>;
}

export interface SavedItinerary {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  overview: string;
  data: ItineraryData;
  config?: { baseCurrency?: string; [key: string]: any };
  likes: number;
  isPublic: boolean;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  username: string; // Unique explorer handle
  displayName: string;
  photoURL: string;
  bio: string;
  preferredCurrency?: 'USD' | 'EUR' | 'GBP' | 'NAD';
  achievements: string[];
  stats: {
    totalLikes: number;
    totalTrips: number;
    daysExplored: number;
  };
  vehicle: Vehicle;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string; // Optional for group chats
  text: string;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  isGroup: boolean;
  name?: string;
  members: string[]; // List of UIDs
  updatedAt: any;
  avatarURL?: string;
}
