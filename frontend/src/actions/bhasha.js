"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

        // Determine if it's a known or unknown language based on confidence threshold
        const CONFIDENCE_THRESHOLD = 0.75;
        
        if (confidence >= CONFIDENCE_THRESHOLD) {
            // Save as a known sample
            const knownSample = await prisma.knownSample.create({
                data: {
                    fileUrl: file_url || "",
                    language: language || "unknown",
                    confidence: confidence || 0,
                    transcript: transcript || null,
                    region: `${lat},${lng}`,
                    keywords: transcript || "", // You might want to extract actual keywords
                }
            });

            return {
                success: true,
                type: "known",
                id: knownSample.id,
                language: knownSample.language
            };
        } else {
            // Save as an unknown sample
            const unknownSample = await prisma.unknownSample.create({
                data: {
                    fileUrl: file_url || "",
                    languageGuess: language || null,
                    confidence: confidence || 0,
                    transcript: transcript || null,
                    clusterId: cluster_id || null,
                    region: `${lat},${lng}`,
                    keywords: transcript || "", // You might want to extract actual keywords
                    embedding: embedding || []
                }
            });

            return {
                success: true,
                type: "unknown",
                id: unknownSample.id,
                clusterId: cluster_id
            };
        }
    } catch (error) {
        console.error("Database save error:", error);
        throw new Error(`Failed to save to database: ${error.message}`);
    }
}
