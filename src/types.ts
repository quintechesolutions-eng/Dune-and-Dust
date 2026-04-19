export interface Traveler {
  id: number;
  name: string;
  age: number;
  hasLicense: boolean;
  dietary: string;
}

export interface Vehicle {
  make: string;
  model: string;
  drivetrain: string;
  fuelType: string;
}

export interface Logistics {
  days: number;
  month: string;
  budget: string;
  pace: string;
  detailLevel: string;
}

export interface TripConfig {
  selectedRegions: string[];
  travelers: Traveler[];
  vehicle: Vehicle;
  selectedInterests: string[];
  logistics: Logistics;
}

export interface ItineraryData {
  tripSummary: {
    headline: string;
    overview: string;
    travelerNotes: string;
    totalEstimatedDistanceKm: number;
  };
  logistics: {
    packingList: string[];
    fuelAdvice: string;
    estimatedBudgetTotalUSD: number;
  };
  dailyPlan: Array<{
    day: number;
    location: string;
    driveTimeHours: string;
    fuelStopRecommendations: string;
    description: string;
    activities: string[];
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
      dietaryNotes: string;
    };
    accommodation: {
      name: string;
      type: string;
      bookingSearchQuery: string;
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
  likes: number;
  isPublic: boolean;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  vehicle: Vehicle;
  preferredRegions: string[];
  totalTripsPlanned: number;
}
