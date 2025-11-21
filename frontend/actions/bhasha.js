"use server";

import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateKeywords(transcript, lat, long) {
  if (!transcript) return [];

  const prompt = `
  You are "BhashaGuru", an expert linguist, dialect researcher, 
  and regional language analyst specializing in Indian linguistic zones.

  Your task:
  1. Identify the geographic region based on the given latitude and longitude.
  2. Determine the most commonly spoken language(s) in that region.
  3. Analyze the transcript in context of the region and language.
  4. Extract 5-10 high-quality keywords that strongly represent the meaning,
    cultural cues, dialect hints, or unique entities in the transcript.
  5. Explain the meaning of the transcript IN THE DETECTED LANGUAGE 
    (if the language is English, keep it in English).
  6. Keep the output short, crisp, and extremely clear.

  Rules:
  - Keyword list must be ONLY comma-separated words.
  - No extra commentary.
  - If the transcript is empty, return an empty keyword list and an empty explanation.

  INPUT:
  Latitude: ${lat}
  Longitude: ${long}
  Transcript: "${transcript}"

  Return a string
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return result.response.text();
}


export async function saveToDB(data) {
  try {
    const keywords = await generateKeywords(data.transcript, data.lat, data.long);
    if (data.clusterId !== null && data.clusterId !== undefined) {
      const saved = await prisma.unknownSample.create({
        data: {
          fileUrl: data.fileUrl,
          languageGuess: data.languageGuess ?? null,
          confidence: data.confidence,
          transcript: data.transcript ?? null,
          clusterId: data.clusterId,
          lat: data.lat ?? null,
          lng: data.lng ?? null,
          keywords: keywords
        },
      });

      await prisma.cluster.update({
        where: { id: data.clusterId },
        data: { sampleCount: { increment: 1 } },
      });

      return { status: "unknown_saved", saved };
    }

    const saved = await prisma.knownSample.create({
      data: {
        fileUrl: data.fileUrl,
        language: data.language ?? "Unknown",
        confidence: data.confidence,
        transcript: data.transcript ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        keywords: keywords
      },
    });

    return { status: "known_saved", saved };
  } catch (err) {
    console.error("DB Save Error:", err);
    throw new Error("Failed to save to DB");
  }
}




