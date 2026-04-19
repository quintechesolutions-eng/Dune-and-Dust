import { GoogleGenAI, Type } from "@google/genai";
import { TripConfig, ItineraryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const outputSchema = {
  type: Type.OBJECT,
  properties: {
    tripSummary: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        overview: { type: Type.STRING },
        travelerNotes: { type: Type.STRING, description: "Notes on how the trip suits the specific ages and diets provided." },
        totalEstimatedDistanceKm: { type: Type.INTEGER }
      },
      required: ["headline", "overview", "travelerNotes", "totalEstimatedDistanceKm"]
    },
    logistics: {
      type: Type.OBJECT,
      properties: {
        packingList: { type: Type.ARRAY, items: { type: Type.STRING } },
        fuelAdvice: { type: Type.STRING, description: "Specific advice regarding fuel stations for the specific vehicle and fuel type." },
        estimatedBudgetTotalUSD: { type: Type.INTEGER }
      },
      required: ["packingList", "fuelAdvice", "estimatedBudgetTotalUSD"]
    },
    dailyPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          location: { type: Type.STRING },
          driveTimeHours: { type: Type.STRING },
          fuelStopRecommendations: { type: Type.STRING },
          description: { type: Type.STRING },
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
              bookingSearchQuery: { type: Type.STRING }
            },
            required: ["name", "type", "bookingSearchQuery"]
          }
        },
        required: ["day", "location", "driveTimeHours", "fuelStopRecommendations", "description", "activities", "meals", "accommodation"]
      }
    }
  },
  required: ["tripSummary", "logistics", "dailyPlan"]
};

export const generateItinerary = async (config: TripConfig): Promise<ItineraryData> => {
  const prompt = `
    Create a custom Namibian travel itinerary.
    
    Travelers: ${config.travelers.length} people.
    ${config.travelers.map(t => `- ${t.name} (Age: ${t.age}, Driver License: ${t.hasLicense ? 'Yes' : 'No'}, Diet: ${t.dietary})`).join('\n')}
    
    Vehicle Details: ${config.vehicle.make} ${config.vehicle.model} (${config.vehicle.drivetrain}), Fuel: ${config.vehicle.fuelType}.
    *CRITICAL: Provide specific fuel stop advice based on a ${config.vehicle.fuelType} vehicle driving in Namibia.*
    
    Trip Logistics:
    - Days: ${config.logistics.days}
    - Month: ${config.logistics.month}
    - Budget: ${config.logistics.budget}
    - Pace: ${config.logistics.pace}
    - Detail Level Required: ${config.logistics.detailLevel.toUpperCase()}
    
    Selected Regions to Visit: ${config.selectedRegions.join(', ')}.
    Specific Interests Requested: ${config.selectedInterests.join(', ')}.

    INSTRUCTIONS:
    1. Base all activities predominantly on the selected regions and specific interests.
    2. Adjust the length and verbosity of the descriptions based on the "Detail Level Required".
    3. Account for realistic driving times for the specific vehicle type.
    4. Provide lodge names that fit the exact budget.
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
