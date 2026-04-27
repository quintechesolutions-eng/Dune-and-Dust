import { OpenRouter } from "@openrouter/sdk";
import { TripConfig, ItineraryData } from "../types";
import { ACTIVITIES_DATA } from "../activities-data";
import { getNearbyOSMPlaces, OSMPlace } from "./osm";
import { LODGING_DATA, LodgingOption } from "./lodging";

const MAJOR_HUBS = ['Windhoek', 'Swakopmund', 'Walvis Bay', 'Luderitz', 'Rundu', 'Etosha', 'Sesriem'];

const openrouter = new OpenRouter({ apiKey: process.env.GEMINI_API_KEY as string });

const outputSchemaStr = `{
  "tripSummary": {
    "headline": "string",
    "overview": "string",
    "travelerNotes": "string",
    "totalEstimatedDistanceKm": "number",
    "climateExpectancy": "string",
    "wildlifeExpectancy": "string",
    "startingPoint": {
      "location": "string",
      "latitude": "number",
      "longitude": "number"
    }
  },
  "logistics": {
    "packingList": ["string"],
    "fuelAdvice": "string",
    "transportBookingQuery": "string",
    "estimatedBudgetTotal": "number",
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
        "dinner": "string"
      },
      "accommodation": {
        "name": "string",
        "type": "string",
        "bookingSearchQuery": "string",
        "features": ["string"],
        "listings": [
          {
            "name": "string",
            "price": "number",
            "currency": "string",
            "rating": "number",
            "recommendationReason": "string"
          }
        ],
        "finalRecommendationReason": "string"
      }
    }
  ]
}`;

export const generateItinerary = async (config: TripConfig): Promise<ItineraryData> => {
  const fuelInfo = config.vehicle.fuelConsumptionL100km 
    ? `Fuel Consumption: ~${config.vehicle.fuelConsumptionL100km}L/100km. Use this to calculate realistic fuel costs (Namibian diesel ~N$22/L, petrol ~N$24/L).`
    : '';

  const prompt = `
    Create a custom Namibian travel itinerary.
    
    Travelers: ${config.travelers.length} people.
    ${config.travelers.map(t => `- ${t.name} (Age: ${t.age}, Driver License: ${t.hasLicense ? 'Yes' : 'No'}, Budget: ${t.budget || 0} ${config.baseCurrency || 'USD'})`).join('\n')}
    Total Group Budget: ${config.travelers.reduce((acc, t) => acc + (t.budget || 0), 0)} ${config.baseCurrency || 'USD'}
    
    Vehicle Details: ${config.vehicle.make} (${config.vehicle.rentalMode === 'rental' ? 'Renting' : 'Own Vehicle'}, ${config.vehicle.drivetrain}), Fuel: ${config.vehicle.fuelType}.
    Number of Vehicles: ${config.vehicle.numberOfVehicles || 1}${config.vehicle.numberOfVehicles > 1 ? ' (convoy — multiply fuel costs accordingly!)' : ''}.
    ${fuelInfo}
    *CRITICAL: Provide specific fuel stop advice based on the vehicle type and consumption rate.*

    Trip Logistics:
    - Travel Style: ${config.logistics.stayStyle === 'basecamp' ? 'Basecamp (Stay at ONE single accommodation for the entire trip and take day trips)' : 'Nomadic (Move between different accommodations along the route)'}
    - Custom Pickups/Starts: ${config.customPickups && config.customPickups.length > 0 ? JSON.stringify(config.customPickups) : config.logistics.startingLocation || 'Not specified'}
    - Days: ${config.logistics.days}
    - Month: ${config.logistics.month}
    - Base Currency: ${config.baseCurrency || 'USD'}
    - Lodging/Accommodation Scope: ${config.logistics.accommodationStyles.length > 0 ? config.logistics.accommodationStyles.join(', ') : config.logistics.budget}
    - Budget Priorities: ${config.logistics.budgetPriorities?.join(', ') || 'Standard'}
    ${config.logistics.specificAccommodation ? `- Specific Accommodation Requested by User: ${config.logistics.specificAccommodation}` : ''}
    - Pace: ${config.logistics.pace}
    - Trip Mood: ${config.logistics.mood || 'Not specified'}
    - Exact Dates: ${config.logistics.startDate ? `${config.logistics.startDate} to ${config.logistics.endDate}` : 'Not specified'}
    
    Selected Regions to Visit: ${config.selectedRegions.length > 0 ? config.selectedRegions.join(', ') : 'Suggest best locations'}.
    Specific Interests Requested: ${config.selectedInterests.join(', ')}.

    AUTHENTIC ACTIVITIES REFERENCE:
    Below is a list of REAL activities available in the selected regions. You MUST prioritize using these exact activities where they fit the itinerary. DO NOT make up imaginary activities.
    ${ACTIVITIES_DATA.filter(a => config.selectedRegions.includes(a.region)).map(a => `- [${a.region.toUpperCase()}] ${a.label}`).join('\n')}

    REAL LODGING DATABASE:
    Below are REAL accommodation options for the regions you might visit. For each day, you MUST 'fetch' (select) 2-3 relevant listings from this list, compare them in your mind based on the traveler's budget and preferences, and then provide a 'finalRecommendationReason' for your chosen one.
    ${LODGING_DATA.filter(l => config.selectedRegions.some(r => l.region.toLowerCase().includes(r.toLowerCase())) || config.logistics.startingLocation?.includes(l.region)).map(l => `- [${l.region}] ${l.name} (${l.type}): ~${l.priceRange.min}-${l.priceRange.max} ${l.currency} - ${l.features.join(', ')}`).join('\n')}

    INSTRUCTIONS:
    1. Base all activities STRICTLY on real-world Namibian landmarks and the 'AUTHENTIC ACTIVITIES REFERENCE' provided above. Provide 2-4 distinct activities per day.
    2. Start the itinerary logically from the starting location.
    3. Be DETAILED AND IMMERSIVE in the 'overview' and daily 'description'.
    4. Account for realistic driving times. Format 'driveTimeHours' as "3.5 hours (~250km)".
    5. HOUSING & LISTINGS: For EVERY daily stop, you MUST:
       a. Identify the location.
       b. Search the 'REAL LODGING DATABASE' above for options in that region.
       c. Populate the 'accommodation.listings' array with 2-3 accurate options from the database.
       d. Add accurate prices (use the mid-point of the provided price range).
       e. In 'finalRecommendationReason', EXPLAIN why you chose the primary 'name' over the other listings (e.g., "Best value for budget", "Unbeatable waterhole views", "Closer to the dunes").
    6. Ensure 'transportBookingQuery' (under logistics) is an accurate search query.
    7. ACCURATE COORDINATES: Provide accurate 'latitude' and 'longitude' for EVERY stop/lodge.
    8. FUEL CALCULATION: Use the provided fuel consumption rate to calculate realistic fuel costs.
    9. STAY STYLE: If 'Basecamp', use the EXACT SAME accommodation for EVERY day.
    10. ACCURATE PRICING: Under \`logistics.estimatedBudgetTotal\`, give a REALISTIC budget in ${config.baseCurrency || 'USD'}.
    11. MEALS: Provide specific local dish names and restaurant suggestions.
    12. UNIQUENESS: Suggest at least one surprising or unconventional activity.
    13. REAL-WORLD RESEARCH: Act as if you are searching live databases. Provide REAL pricing and REAL housing options.
    14. ACCURATE GEOLOCATION: Ensure the 'latitude' and 'longitude' are pinpoint accurate.
    15. DATES & MOOD: Center the itinerary flow around the requested MOOD.
    16. STARTING POINT: Provide coordinates for the starting location: ${config.logistics.startingLocation || 'Windhoek'}.
  `;

  const systemInstruction = `You are an elite Namibian travel architect. Output STRICTLY VALID JSON. DO NOT TRUNCATE YOUR RESPONSE.

    GEOGRAPHIC REFERENCE (Coordinates):
    Use these exact coordinates for markers:
    - Windhoek: -22.5609, 17.0658
    - Swakopmund: -22.6784, 14.5268
    - Walvis Bay: -22.9575, 14.5053
    - Sesriem/Sossusvlei: -24.4862, 15.7957
    - Etosha (Okaukuejo): -19.1691, 15.9174
    - Etosha (Namutoni): -18.8058, 16.9419
    - Fish River Canyon: -27.6119, 17.7175
    - Luderitz: -26.6477, 15.1594
    - Twyfelfontein: -20.5950, 14.3736
    - Epupa Falls: -17.0008, 13.2450
    - Rundu: -17.9154, 19.7633
    - Katima Mulilo: -17.5021, 24.2741
    - Waterberg: -20.5114, 17.2411
    - Brandberg: -21.1444, 14.5750
    - Kolmanskop: -26.7042, 15.2319
    - Cape Cross: -21.7708, 13.9872

    ACCOMMODATION & RESEARCH INSTRUCTIONS:
    - If the user mentions a specific town or location, you MUST 'research' (use your knowledge) to suggest REAL, highly-rated accommodations in that specific area.
    - DO NOT use generic names like "Desert Lodge" or "Coastal Hotel". Use specific names (e.g., "Strand Hotel Swakopmund", "Desert Quiver Camp", "GocheGanas", "Okaukuejo Resort").
    - Activities MUST match the specific location (e.g., if in Swakopmund, suggest "Sandwich Harbour 4x4" or "Walvis Bay Catamaran").

    CRITICAL JSON RULES:
    - You MUST return a complete, valid JSON object matching the exact schema below.
    - DO NOT use the symbol "=>" inside JSON. ALWAYS use colons ":" for key-value pairs.
    - DO NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY raw JSON text.

    SCHEMA:
    ${outputSchemaStr}`;

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
  
  // Clean markdown wrap and fix common syntax errors made by this specific AI model (e.g. using '=>' instead of ':')
  text = text.replace(/^\`\`\`(json)?\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
  text = text.replace(/"\s*=>\s*/g, '": '); // Fixes "key" => value
  text = text.replace(/'\s*=>\s*/g, "': ");
  
  // Fix missing colons between key and value (common AI hallucination)
  text = text.replace(/"([^"]+)"\s+([0-9"[{])/g, '"$1": $2');
  
  // Try to salvage truncated JSON (basic trailing closure)
  if (!text.endsWith('}')) {
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;
    
    // Quick and dirty append to close the JSON structure
    if (text[text.length-1] === ',') text = text.slice(0, -1);
    else if (text[text.length-1] !== '"' && text[text.length-1] !== '}' && text[text.length-1] !== ']') {
       // if trailing string without closing quote
       if ((text.match(/"/g) || []).length % 2 !== 0) {
           text += '"';
       }
    }

    if (openBrackets > closeBrackets) text += ']'.repeat(openBrackets - closeBrackets);
    if (openBraces > closeBraces) text += '}'.repeat(openBraces - closeBraces);
  }

  try {
    const data = JSON.parse(text) as ItineraryData;
    // Enrich with real-world places sparingly from multiple sources
    return await enrichItineraryWithRealWorldData(data);
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", text);
    throw err;
  }
};

/**
 * Enriches the itinerary with real-world data from OpenStreetMap.
 * This ensures even remote areas have some real landmarks and fuel stops.
 */
async function enrichItineraryWithRealWorldData(data: ItineraryData): Promise<ItineraryData> {
  const enrichedPlan = await Promise.all(data.dailyPlan.map(async (day) => {
    if (!day.latitude || !day.longitude) return day;

    // Fetch from OSM
    const osmPlaces = await getNearbyOSMPlaces(day.latitude, day.longitude, 10000); // 10km radius
    
    if (!day.waypoints) day.waypoints = [];

    // Process OSM results
    if (osmPlaces.length > 0) {
      // Find a viewpoint or campsite if the AI was vague
      const viewpoint = osmPlaces.find(p => p.tags.tourism === 'viewpoint');
      if (viewpoint && viewpoint.tags.name && !day.activities.some(a => a.includes(viewpoint.tags.name!))) {
        day.activities.push(`Panoramic views from ${viewpoint.tags.name} (Local Landmark)`);
        day.waypoints.push({ type: 'activity', name: viewpoint.tags.name, latitude: viewpoint.lat, longitude: viewpoint.lon });
      }

      // Add fuel stops - CRITICAL
      const fuel = osmPlaces.find(p => p.tags.amenity === 'fuel');
      if (fuel && fuel.tags.name) {
        day.fuelStopRecommendations = `Refuel at ${fuel.tags.name} (${day.location}).`;
        day.waypoints.push({ type: 'fuel', name: fuel.tags.name, latitude: fuel.lat, longitude: fuel.lon });
      }

      // Find local restaurants or pubs
      if (day.meals.dinner.includes('AI Suggested') || day.meals.dinner.length < 15) {
        const osmResto = osmPlaces.find(p => p.tags.amenity === 'restaurant' || p.tags.amenity === 'pub' || p.tags.amenity === 'cafe');
        if (osmResto && osmResto.tags.name) {
          day.meals.dinner = `Dine at ${osmResto.tags.name} (Local Discovery).`;
          day.waypoints.push({ type: 'meal', name: osmResto.tags.name, latitude: osmResto.lat, longitude: osmResto.lon });
        }
      }
      
      // If we found a cafe but no dinner resto, use it for lunch
      const osmCafe = osmPlaces.find(p => p.tags.amenity === 'cafe');
      if (osmCafe && osmCafe.tags.name && (day.meals.lunch.includes('AI Suggested') || day.meals.lunch.length < 15)) {
        day.meals.lunch = `Quick bite at ${osmCafe.tags.name}.`;
        day.waypoints.push({ type: 'meal', name: osmCafe.tags.name, latitude: osmCafe.lat, longitude: osmCafe.lon });
      }
    }

    return day;
  }));

  data.dailyPlan = enrichedPlan;
  return data;
}

/**
 * Cleans raw AI text into valid JSON, repairing common model quirks.
 */
function cleanAndParseJSON(raw: string): any {
  let text = raw.replace(/^`{1,3}(json)?\s*/i, '').replace(/`{1,3}\s*$/i, '').trim();
  text = text.replace(/"\s*=>\s*/g, '": ');
  text = text.replace(/'\s*=>\s*/g, "': ");

  if (!text.endsWith('}')) {
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;
    const openBrackets = (text.match(/\[/g) || []).length;
    const closeBrackets = (text.match(/\]/g) || []).length;

    if (text[text.length - 1] === ',') text = text.slice(0, -1);
    else if (!['"', '}', ']'].includes(text[text.length - 1])) {
      if ((text.match(/"/g) || []).length % 2 !== 0) text += '"';
    }
    if (openBrackets > closeBrackets) text += ']'.repeat(openBrackets - closeBrackets);
    if (openBraces > closeBraces) text += '}'.repeat(openBraces - closeBraces);
  }

  return JSON.parse(text);
}

/**
 * Generate a full itinerary from a freeform natural-language description.
 * The AI interprets the user's prose and produces the same ItineraryData schema.
 */
export const generateFromDescription = async (
  description: string,
  baseCurrency: string = 'USD'
): Promise<ItineraryData> => {

  const systemInstruction = `You are an elite Namibian travel architect. The user will describe a trip they want in plain English. Your job is to interpret their description and produce a COMPLETE travel itinerary in STRICTLY VALID JSON.

    GEOGRAPHIC REFERENCE (Coordinates):
    Use these exact coordinates for markers:
    - Windhoek: -22.5609, 17.0658
    - Swakopmund: -22.6784, 14.5268
    - Walvis Bay: -22.9575, 14.5053
    - Sesriem/Sossusvlei: -24.4862, 15.7957
    - Etosha (Okaukuejo): -19.1691, 15.9174
    - Etosha (Namutoni): -18.8058, 16.9419
    - Fish River Canyon: -27.6119, 17.7175
    - Luderitz: -26.6477, 15.1594
    - Twyfelfontein: -20.5950, 14.3736
    - Epupa Falls: -17.0008, 13.2450
    - Rundu: -17.9154, 19.7633
    - Katima Mulilo: -17.5021, 24.2741
    - Waterberg: -20.5114, 17.2411
    - Brandberg: -21.1444, 14.5750
    - Kolmanskop: -26.7042, 15.2319
    - Cape Cross: -21.7708, 13.9872

    ACCOMMODATION & RESEARCH INSTRUCTIONS:
    - You MUST fetch real listings for every stop from the database provided below.
    - Compare 2-3 options and explain your choice in 'finalRecommendationReason'.

    REAL LODGING DATABASE:
    ${LODGING_DATA.map(l => `- [${l.region}] ${l.name} (${l.type}): ~${l.priceRange.min}-${l.priceRange.max} ${l.currency} - ${l.features.join(', ')}`).join('\n')}

    ALL monetary values MUST be returned in ${baseCurrency}.

    CRITICAL JSON RULES:
    - Return ONLY a raw JSON object. No markdown, no wrapping, no commentary.
    - DO NOT use "=>" for key-value pairs. ALWAYS use ":".
    - DO NOT truncate. Return the COMPLETE object.

    SCHEMA:
    ${outputSchemaStr}`;

  const prompt = `Here is the user's trip description in their own words:

"${description}"

    AUTHENTIC ACTIVITIES REFERENCE:
    Use real-world Namibian activities such as: ${ACTIVITIES_DATA.slice(0, 50).map(a => a.label).join(', ')}.

    Create a detailed, immersive Namibian itinerary based on this description. Infer all details the user didn't specify. Use ONLY real activities and landmarks. DO NOT hallucinate imaginary tours. Format driveTimeHours as "X hours (~Ykm)". Provide real restaurant names and local dishes for meals. Use accurate GPS coordinates for every location. Return budget values in ${baseCurrency}.`;

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

  try {
    const data = cleanAndParseJSON(text) as ItineraryData;
    return await enrichItineraryWithRealWorldData(data);
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", text);
    throw err;
  }
};

/**
 * Modifies an existing itinerary based on user instructions.
 */
export const modifyItinerary = async (
  currentItinerary: ItineraryData,
  instruction: string,
  config: TripConfig
): Promise<ItineraryData> => {
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
      "estimatedBudgetTotal": "number",
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
          "dinner": "string"
        },
        "accommodation": {
          "name": "string",
          "type": "string",
          "bookingSearchQuery": "string",
          "features": ["string"],
          "listings": [
            {
              "name": "string",
              "price": "number",
              "currency": "string",
              "rating": "number",
              "recommendationReason": "string"
            }
          ],
          "finalRecommendationReason": "string"
        }
      }
    ]
  }`;

  const systemInstruction = `You are an elite Namibian travel architect. You will receive a CURRENT travel itinerary in JSON format and a USER INSTRUCTION on how to change it. Your goal is to produce a NEW, modified version of the JSON that incorporates those changes while maintaining the original quality and structure.

    CRITICAL RULES:
    1. Output ONLY the modified JSON. No commentary.
    2. Maintain all real-world accuracy (coordinates, driving times).
    3. If the user asks for a change that contradicts Namibian reality (e.g. "add a beach in Etosha"), explain why in the 'travelerNotes' section but do your best to fulfill the SPIRIT of the request (e.g. add a luxury pool day).
    4. Ensure the dailyPlan array remains consistent in its numbering.

    SCHEMA:
    ${outputSchemaStr}`;

  const prompt = `
    CURRENT ITINERARY:
    ${JSON.stringify(currentItinerary, null, 2)}

    USER INSTRUCTION FOR CHANGES:
    "${instruction}"

    TRIP CONTEXT:
    - Travelers: ${config?.travelers?.length || 1}
    - Vehicle: ${config?.vehicle?.make || 'Standard 4x4'}
    - Mood: ${config?.logistics?.mood || 'Balanced'}
    - Dates: ${config?.logistics?.startDate || 'Not set'} to ${config?.logistics?.endDate || 'Not set'}

    REAL LODGING DATABASE (for any new stops):
    ${LODGING_DATA.map(l => `- [${l.region}] ${l.name} (${l.type}): ~${l.priceRange.min}-${l.priceRange.max} ${l.currency} - ${l.features.join(', ')}`).join('\n')}

    Apply the changes requested and return the full updated JSON.
    For any new days or changed locations, perform the 'AI Market Analysis' on lodging by selecting 2-3 listings and explaining your recommendation.
  `;

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

  try {
    const data = cleanAndParseJSON(text) as ItineraryData;
    return await enrichItineraryWithRealWorldData(data);
  } catch (err) {
    console.error("Failed to parse AI modification response:", text);
    throw err;
  }
};
