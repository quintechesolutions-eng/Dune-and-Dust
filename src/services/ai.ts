import { OpenRouter } from "@openrouter/sdk";
import { TripConfig, ItineraryData } from "../types";

const openrouter = new OpenRouter({ apiKey: process.env.GEMINI_API_KEY as string });

const outputSchemaStr = `{
  "tripSummary": {
    "headline": "string",
    "overview": "string",
    "travelerNotes": "string",
    "totalEstimatedDistanceKm": "number",
    "climateExpectancy": "string",
    "wildlifeExpectancy": "string"
  },
  "logistics": {
    "packingList": ["string"],
    "fuelAdvice": "string",
    "transportBookingQuery": "string",
    "estimatedBudgetTotalUSD": "number",
    "budgetAllocation": {
      "accommodation": "number",
      "transportation": "number",
      "food": "number",
      "activities": "number"
    }
  },
  "dailyPlan": [
    {
      "day": "number",
      "location": "string",
      "latitude": "number",
      "longitude": "number",
      "driveTimeHours": "string",
      "roadConditions": "string",
      "fuelStopRecommendations": "string",
      "description": "string",
      "activities": ["string"],
      "meals": {
        "breakfast": "string",
        "lunch": "string",
        "dinner": "string",
        "dietaryNotes": "string"
      },
      "accommodation": {
        "name": "string",
        "type": "string",
        "bookingSearchQuery": "string",
        "features": ["string"]
      }
    }
  ]
}`;

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
    2. Start the itinerary logically from the starting location. DO NOT assume the user is taking a flight on the final day.
    3. Be DETAILED AND IMMERSIVE in the 'overview' and daily 'description'. Provide rich, multi-sentence narratives that capture the magic of the location.
    4. Account for realistic driving times. You MUST format 'driveTimeHours' to include both time and distance, e.g., "3.5 hours (~250km)".
    5. Provide lodging names that fit the explicitly requested 'Accommodation Scope' and budget priorities. 
    ${config.logistics.specificAccommodation ? `5b. CRITICAL: The user has requested a specific accommodation: ${config.logistics.specificAccommodation}. You MUST center their entire stay AND coordinates around THIS specific accommodation.` : ''}
    6. Ensure 'transportBookingQuery' (under logistics) is an accurate search query for finding rental cars for the user's vehicle type.
    7. ACCURATE COORDINATES: You MUST provide an accurate 'latitude' and 'longitude' mapping to a real place for EVERY SINGLE stop/lodge.
    8. WAYPOINTS: Populate 'waypoints' with exact lat/lngs for gas stations and meal stops.
    9. STAY STYLE AND OVERLAPPING: If 'Basecamp', use the EXACT SAME accommodation (name, latitude, longitude) for EVERY day.
    10. ACCURATE PRICING: Under \`logistics.estimatedBudgetTotalUSD\`, give a REALISTIC budget based on true current prices, CONVERTED AND RETURNED IN THE USER'S BASE CURRENCY (${config.baseCurrency || 'USD'}). Do not just spit out the user's budget.
    11. MEALS: For daily meals, provide specific local dish recommendations or actual restaurant names, DO NOT just say "Breakfast at lodge". Provide actual food inspiration.
  `;

  const systemInstruction = `You are an elite Namibian travel architect. Output STRICTLY VALID JSON. Be concise enough to ensure the JSON successfully terminates.

Your output MUST be a JSON object matching this schema exactly:
${outputSchemaStr}

DO NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY raw JSON text.`;

  const response = await openrouter.chat.send({
    chatRequest: {
      model: "inclusionai/ling-2.6-flash:free",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ]
    }
  });

  let text = response.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from AI");
  
  text = text.replace(/^\`\`\`(json)?\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
  
  try {
    return JSON.parse(text) as ItineraryData;
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", text);
    throw err;
  }
};
