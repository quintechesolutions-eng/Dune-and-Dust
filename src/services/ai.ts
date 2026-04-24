import { OpenRouter } from "@openrouter/sdk";
import { TripConfig, ItineraryData } from "../types";
import { ACTIVITIES_DATA } from "../activities-data";

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
        "features": ["string"]
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
    
    Selected Regions to Visit: ${config.selectedRegions.length > 0 ? config.selectedRegions.join(', ') : 'Suggest best locations'}.
    Specific Interests Requested: ${config.selectedInterests.join(', ')}.

    AUTHENTIC ACTIVITIES REFERENCE:
    Below is a list of REAL activities available in the selected regions. You MUST prioritize using these exact activities where they fit the itinerary. DO NOT make up imaginary activities.
    ${ACTIVITIES_DATA.filter(a => config.selectedRegions.includes(a.region)).map(a => `- [${a.region.toUpperCase()}] ${a.label}`).join('\n')}

    INSTRUCTIONS:
    1. Base all activities STRICTLY on real-world Namibian landmarks and the 'AUTHENTIC ACTIVITIES REFERENCE' provided above. Provide 2-4 distinct activities per day. DO NOT suggest imaginary or impossible activities (e.g., no 'kayaking in the desert' unless it's a real river, no 'riding rhinos').
    2. Start the itinerary logically from the starting location or the Custom Pickups specified. Ensure you route through the requested pickups in order if provided.
    3. Be DETAILED AND IMMERSIVE in the 'overview' and daily 'description'. Provide rich, multi-sentence narratives that paint a vivid picture of the REAL landscape.
    4. Account for realistic driving times. You MUST format 'driveTimeHours' to include both time and distance, e.g., "3.5 hours (~250km)".
    5. Provide lodging names that fit the explicitly requested 'Accommodation Scope' and budget priorities. 
    ${config.logistics.specificAccommodation ? `5b. CRITICAL: The user has requested a specific accommodation: ${config.logistics.specificAccommodation}. You MUST center their entire stay AND coordinates around THIS specific accommodation.` : ''}
    6. Ensure 'transportBookingQuery' (under logistics) is an accurate search query for finding rental cars for the user's vehicle type.
    7. ACCURATE COORDINATES: You MUST provide an accurate 'latitude' and 'longitude' mapping to a real place for EVERY SINGLE stop/lodge.
    8. FUEL CALCULATION: Use the provided fuel consumption rate (${config.vehicle.fuelConsumptionL100km || 12}L/100km) × total distance × number of vehicles (${config.vehicle.numberOfVehicles || 1}) to calculate realistic fuel costs within the budget allocation.
    9. STAY STYLE: If 'Basecamp', use the EXACT SAME accommodation for EVERY day.
    10. ACCURATE PRICING: Under \`logistics.estimatedBudgetTotal\`, give a REALISTIC budget in the user's base currency (${config.baseCurrency || 'USD'}). Do not just echo the user's stated budget.
    11. MEALS: Provide specific local dish names and restaurant suggestions. DO NOT just say "Breakfast at lodge".
    12. UNIQUENESS: Each itinerary should feel personal and unique. Suggest at least one surprising or unconventional activity the travelers wouldn't have thought of on their own.
    13. REAL-WORLD RESEARCH: You are expected to act as if you are searching live databases. Provide REAL pricing, REAL restaurant names, and REAL housing options. If a user names a town, center your research on that town's actual infrastructure.
    14. ACCURATE GEOLOCATION: Ensure the 'latitude' and 'longitude' for every daily stop are pinpoint accurate. Use the provided GEOGRAPHIC REFERENCE for major hubs.
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
    return JSON.parse(text) as ItineraryData;
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", text);
    throw err;
  }
};

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
    - You MUST suggest REAL, highly-rated accommodations for every town mentioned.
    - Activities MUST match the specific location realistically.

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
    return cleanAndParseJSON(text) as ItineraryData;
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", text);
    throw err;
  }
};
