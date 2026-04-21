import { GoogleGenAI, Type } from "@google/genai";
import { TripConfig, ItineraryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const outputSchema = {
  type: Type.OBJECT,
  properties: {
    tripSummary: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "A captivating, epic title for the journey." },
        overview: { type: Type.STRING, description: "A detailed, expansive 2-3 paragraph overview of the entire journey. What makes it special, the general routing, and the core experience." },
        travelerNotes: { type: Type.STRING, description: "Notes on how the trip suits the specific ages and diets provided." },
        totalEstimatedDistanceKm: { type: Type.INTEGER },
        climateExpectancy: { type: Type.STRING, description: "Expected weather conditions based on the month." },
        wildlifeExpectancy: { type: Type.STRING, description: "Key wildlife species highly probable to be encountered." }
      },
      required: ["headline", "overview", "travelerNotes", "totalEstimatedDistanceKm", "climateExpectancy", "wildlifeExpectancy"]
    },
    logistics: {
      type: Type.OBJECT,
      properties: {
        packingList: { type: Type.ARRAY, items: { type: Type.STRING } },
        fuelAdvice: { type: Type.STRING, description: "Specific advice regarding fuel stations for the specific vehicle and fuel type. e.g. How often to fuel a hybrid or charge an EV." },
        transportBookingQuery: { type: Type.STRING, description: "A Google search query to find rental cars for this specific vehicle type, e.g. '4x4 Double Cab rental Windhoek'" },
        estimatedBudgetTotalUSD: { type: Type.INTEGER },
        budgetAllocation: {
          type: Type.OBJECT,
          properties: {
            accommodation: { type: Type.INTEGER, description: "Estimated cost for all accommodations/lodging" },
            transportation: { type: Type.INTEGER, description: "Estimated cost for vehicle specific fuel/rental/flights" },
            food: { type: Type.INTEGER, description: "Estimated cost for all food and dining" },
            activities: { type: Type.INTEGER, description: "Estimated cost for activities/park fees" }
          },
          required: ["accommodation", "transportation", "food", "activities"]
        }
      },
      required: ["packingList", "fuelAdvice", "transportBookingQuery", "estimatedBudgetTotalUSD", "budgetAllocation"]
    },
    dailyPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          location: { type: Type.STRING },
          latitude: { type: Type.NUMBER, description: "Accurate latitude for the specific location/lodge" },
          longitude: { type: Type.NUMBER, description: "Accurate longitude for the specific location/lodge" },
          driveTimeHours: { type: Type.STRING },
          roadConditions: { type: Type.STRING, description: "E.g., Tarred, heavy corrugation, deep sand, requires 4x4 engagement." },
          fuelStopRecommendations: { type: Type.STRING },
          description: { type: Type.STRING, description: "A lengthy, immersive narrative of the day's events, scenery, and activities." },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          meals: {
            type: Type.OBJECT,
            properties: {
              breakfast: { type: Type.STRING },
              lunch: { type: Type.STRING },
              dinner: { type: Type.STRING },
              dietaryNotes: { type: Type.STRING }
            },
            required: ["breakfast", "lunch", "dinner", "dietaryNotes"]
          },
          accommodation: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              bookingSearchQuery: { type: Type.STRING },
              features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "E.g. ['Pool', 'Waterhole view', 'Wi-Fi']" }
            },
            required: ["name", "type", "bookingSearchQuery", "features"]
          }
        },
        required: ["day", "location", "latitude", "longitude", "driveTimeHours", "roadConditions", "fuelStopRecommendations", "description", "activities", "meals", "accommodation"]
      }
    }
  },
  required: ["tripSummary", "logistics", "dailyPlan"]
};

export const generateItinerary = async (config: TripConfig): Promise<ItineraryData> => {
  const prompt = `
    Create a custom Namibian travel itinerary.
    
    Travelers: ${config.travelers.length} people.
    ${config.travelers.map(t => `- ${t.name} (Age: ${t.age}, Driver License: ${t.hasLicense ? 'Yes' : 'No'}, Diet: ${t.dietary}, Budget: $${t.budgetUsd || 0})`).join('\n')}
    Total Group Budget: $${config.travelers.reduce((acc, t) => acc + (t.budgetUsd || 0), 0)} USD
    
    Vehicle Details: ${config.vehicle.make} ${config.vehicle.model} (${config.vehicle.drivetrain}), Fuel: ${config.vehicle.fuelType}.
    *CRITICAL: Provide specific fuel stop advice based on a ${config.vehicle.fuelType} vehicle driving in Namibia.*
    
    Trip Logistics:
    - Starting Location / Airport: ${config.logistics.startingLocation}
    - Days: ${config.logistics.days}
    - Month: ${config.logistics.month}
    - Lodging/Accommodation Scope: ${config.logistics.accommodationStyles.length > 0 ? config.logistics.accommodationStyles.join(', ') : config.logistics.budget}
    - Pace: ${config.logistics.pace}
    - Detail Level Required: ${config.logistics.detailLevel.toUpperCase()}
    
    Selected Regions to Visit: ${config.selectedRegions.join(', ')}.
    Specific Interests Requested: ${config.selectedInterests.join(', ')}.

    INSTRUCTIONS:
    1. Base all activities predominantly on the selected regions and specific interests. OVER-DELIVER on activities by listing at least 3-4 highly detailed activities per day.
    2. Start the itinerary strictly from the requested 'Starting Location' and logically route them from there.
    3. Adjust the length and verbosity of the descriptions based on the "Detail Level Required".
    4. Account for realistic driving times for the specific vehicle type in Namibia.
    5. Provide lodging types or names (Booking.com/Airbnb queries) that fit the explicitly requested 'Accommodation Scope' and budget. Ensure 'bookingSearchQuery' is accurate to finding it on Booking.com.
    6. Ensure 'transportBookingQuery' (under logistics) is an accurate search query for finding rental cars for the user's specific vehicle type (e.g. '4x4 Double Cab Campervan Rental Windhoek').
    7. ACCURATE COORDINATES: You MUST provide an accurate 'latitude' and 'longitude' mapping to a real place for EVERY SINGLE stop/lodge in the dailyPlan so it can be rendered on a 3D Mapping engine.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are an elite Namibian travel architect. Output strictly valid JSON. Focus on luxury, precision, and authenticity.",
      responseMimeType: "application/json",
      responseSchema: outputSchema,
      temperature: 0.7
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text) as ItineraryData;
};
