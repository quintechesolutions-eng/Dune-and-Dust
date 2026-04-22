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
    ${config.travelers.map(t => `- ${t.name} (Age: ${t.age}, Driver License: ${t.hasLicense ? 'Yes' : 'No'}, Diet: ${t.dietary}, Budget: ${t.budgetUsd || 0} ${config.baseCurrency || 'USD'})`).join('\n')}
    Total Group Budget: ${config.travelers.reduce((acc, t) => acc + (t.budgetUsd || 0), 0)} ${config.baseCurrency || 'USD'}
    
    Vehicle Details: ${config.vehicle.make} (${config.vehicle.rentalMode === 'rental' ? 'Renting' : 'Own Vehicle'}, ${config.vehicle.drivetrain}), Fuel: ${config.vehicle.fuelType}.
    *CRITICAL: Provide specific fuel stop advice. If renting, add the estimated daily rental cost of this specific 4x4 or sedan type to the overall budget calculation.*

    Trip Logistics:
    - Travel Style: ${config.logistics.stayStyle === 'basecamp' ? 'Basecamp (Stay at ONE single accommodation for the entire trip and take day trips)' : 'Nomadic (Move between different accommodations along the route)'}
    - Starting Location / Airport: ${config.logistics.startingLocation}
    - Days: ${config.logistics.days}
    - Month: ${config.logistics.month}
    - Base Currency: ${config.baseCurrency || 'USD'}
    - Lodging/Accommodation Scope: ${config.logistics.accommodationStyles.length > 0 ? config.logistics.accommodationStyles.join(', ') : config.logistics.budget}
    - Budget Priorities: ${config.logistics.budgetPriorities?.join(', ') || 'Standard'}
    ${config.logistics.specificAccommodation ? `- Specific Accommodation Requested by User: ${config.logistics.specificAccommodation}` : ''}
    - Pace: ${config.logistics.pace}
    
    Selected Regions to Visit: ${config.selectedRegions.length > 0 ? config.selectedRegions.join(', ') : 'Suggest best locations'}.
    Specific Interests Requested: ${config.selectedInterests.join(', ')}.

    INSTRUCTIONS:
    1. Base all activities predominantly on the selected regions and specific interests. Provide 1-3 distinct activities per day. 
    2. Start the itinerary logically from the starting location. DO NOT assume the user is taking a flight on the final day, just route them back to the starting point logically as some may be locals.
    3. Be CONCISE AND STRUCTURED. Limit daily descriptions to 2-3 sentences. DO NOT write excessively long narratives that could exceed output limits and cause the JSON to break.
    4. Account for realistic driving times for the specific vehicle type in Namibia.
    5. Provide lodging names that fit the explicitly requested 'Accommodation Scope' and budget priorities. 
    6. Ensure 'transportBookingQuery' (under logistics) is an accurate search query for finding rental cars for the user's vehicle type.
    7. ACCURATE COORDINATES: You MUST provide an accurate 'latitude' and 'longitude' mapping to a real place for EVERY SINGLE stop/lodge in the dailyPlan so it can be rendered on a 3D Mapping engine.
    8. WAYPOINTS: Populate 'waypoints' with exact lat/lngs for gas stations and meal stops.
    9. STAY STYLE AND OVERLAPPING: If 'Basecamp', use the EXACT SAME accommodation (name, latitude, longitude) for EVERY day. If regions are too scattered for the number of days, dynamically cut them to create a realistic trip.
    10. ACCURATE PRICING: Under \`logistics.estimatedBudgetTotalUSD\` (Note: rename logically in your mind to Total Estimated Budget, return value must remain numeric), give a REALISTIC budget based on true current prices in Namibia, CONVERTED AND RETURNED IN THE USER'S BASE CURRENCY (${config.baseCurrency || 'USD'}). Do not just spit out the user's budget. Calculate the true cost of renting the specified car, actual fuel costs for distances traveled, actual lodge prices, average food inflation, etc. in ${config.baseCurrency || 'USD'}. Reflect actual estimated costs.

  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are an elite Namibian travel architect. Output STRICTLY VALID JSON. Be concise enough to ensure the JSON successfully terminates.",
      responseMimeType: "application/json",
      responseSchema: outputSchema,
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text) as ItineraryData;
};
