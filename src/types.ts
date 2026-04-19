export interface Traveler {
  id: number;
  name: string;
  age: number;
  hasLicense: boolean;
  dietary: string;
  budgetUsd: number;
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
  startingLocation: string;
  accommodationStyles: string[];
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
    climateExpectancy?: string;
    wildlifeExpectancy?: string;
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
    roadConditions?: string;
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
      features?: string[];
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
  username: string; // Unique explorer handle
  displayName: string;
  photoURL: string;
  bio: string;
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
