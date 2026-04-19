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
        required: ["day", "location", "driveTimeHours", "roadConditions", "fuelStopRecommendations", "description", "activities", "meals", "accommodation"]
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
