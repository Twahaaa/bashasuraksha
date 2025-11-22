"use server";

import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generate keywords using Gemini
async function generateKeywords(transcript, lat, lng) {
  if (!transcript) return "";
  
  const prompt = `
You are "BhashaGuru", an expert linguist, dialect researcher, 
and regional language analyst specializing in Indian linguistic zones.

Your task:
1. Identify the geographic region based on the given latitude and longitude.
2. Determine the most commonly spoken language(s) in that region.
3. Analyze the transcript in context of the region and language.
4. Extract 5-10 high-quality keywords that strongly represent the meaning,
   cultural cues, dialect hints, or unique entities in the transcript.

Rules:
- Return ONLY comma-separated keywords, nothing else.
- No extra commentary or explanation.
- If the transcript is empty, return empty string.

INPUT:
Latitude: ${lat}
Longitude: ${lng}
Transcript: "${transcript}"
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.trim();
  } catch (error) {
    console.error("Gemini keyword generation error:", error);
    return "";
  }
}

// Reverse geocode lat/lng to a readable location string
async function getLocationString(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "BhashaSuraksha/1.0" }
    });
    const data = await res.json();
    
    if (data && data.address) {
      const { city, town, village, state } = data.address;
      const cityName = city || town || village || "";
      const stateName = state || "";
      
      if (cityName && stateName) {
        return `${cityName}, ${stateName}`;
      } else if (stateName) {
        return stateName;
      } else if (cityName) {
        return cityName;
      }
    }
    
    // Fallback: return coordinates if geocoding fails
    return `${lat}, ${lng}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat}, ${lng}`;
  }
}

export async function saveToDB(processedData) {
  try {
    const {
      language,
      confidence,
      transcript,
      cluster_id,
      embedding,
      lat,
      lng,
      file_url
    } = processedData;

    // Generate keywords using Gemini
    const keywords = await generateKeywords(transcript, lat, lng);
    
    // Get readable region name from coordinates
    const region = await getLocationString(lat, lng);
    
    console.log("Generated keywords:", keywords);
    console.log("Resolved region:", region);

    const CONFIDENCE_THRESHOLD = 0.75;

    if (confidence >= CONFIDENCE_THRESHOLD) {
      // Save as a known sample (high confidence)
      const knownSample = await prisma.knownSample.create({
        data: {
          fileUrl: file_url || "",
          language: language || "unknown",
          confidence: confidence || 0,
          transcript: transcript || null,
          region: region,
          keywords: keywords,
        }
      });

      return {
        success: true,
        type: "known",
        id: knownSample.id,
        language: knownSample.language,
        region: region
      };
    } else {
      // Save as an unknown sample (low confidence)
      const unknownSample = await prisma.unknownSample.create({
        data: {
          fileUrl: file_url || "",
          languageGuess: language || null,
          confidence: confidence || 0,
          transcript: transcript || null,
          clusterId: cluster_id || null,
          region: region,
          keywords: keywords,
          embedding: embedding || []
        }
      });

      // Update cluster sample count if clusterId exists
      if (cluster_id) {
        await prisma.cluster.update({
          where: { id: cluster_id },
          data: { sampleCount: { increment: 1 } },
        });
      }

      return {
        success: true,
        type: "unknown",
        id: unknownSample.id,
        clusterId: cluster_id,
        region: region
      };
    }
  } catch (error) {
    console.error("Database save error:", error);
    throw new Error(`Failed to save to database: ${error.message}`);
  }
}