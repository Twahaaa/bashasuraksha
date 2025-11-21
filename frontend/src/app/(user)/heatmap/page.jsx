"use server";

import { prisma } from "@/lib/prisma";

export async function saveToDB(data) {
  try {
    // If clusterId exists → UnknownSample
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
        },
      });

      return { status: "unknown_saved", saved };
    }

    // Otherwise → KnownSample
    const saved = await prisma.knownSample.create({
      data: {
        fileUrl: data.fileUrl,
        language: data.language ?? "Unknown",
        confidence: data.confidence,
        transcript: data.transcript ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      },
    });

    return { status: "known_saved", saved };
  } catch (err) {
    console.error("DB Save Error:", err);
    throw new Error("Failed to save to DB");
  }
}
