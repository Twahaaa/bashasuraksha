import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const CONFIDENCE_THRESHOLD = 0.75;

export async function POST(req) {
    try {
        // Get the processed data from the request body
        const processedData = await req.json();

        console.log("Received processed data:", processedData);

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

        let result;

        // Determine if it's a known or unknown language based on confidence threshold
        if (confidence >= CONFIDENCE_THRESHOLD) {
            // Save as a known sample
            result = await prisma.knownSample.create({
                data: {
                    fileUrl: file_url || "",
                    language: language || "unknown",
                    confidence: confidence || 0,
                    transcript: transcript || null,
                    region: `${lat || 0},${lng || 0}`,
                    lat: lat || 0,
                    lng: lng || 0,
                    keywords: transcript || "",
                }
            });

            console.log("Saved as KnownSample:", result.id);

            return NextResponse.json({
                success: true,
                type: "known",
                id: result.id,
                language: result.language,
                message: "Recording saved as known language sample"
            }, { status: 200 });

        } else {
            // Save as an unknown sample
            result = await prisma.unknownSample.create({
                data: {
                    fileUrl: file_url || "",
                    languageGuess: language || null,
                    confidence: confidence || 0,
                    transcript: transcript || null,
                    clusterId: cluster_id || null,
                    region: `${(lat && !isNaN(parseFloat(lat))) ? lat : 0},${(lng && !isNaN(parseFloat(lng))) ? lng : 0}`,
                    lat: (lat && !isNaN(parseFloat(lat))) ? parseFloat(lat) : 0,
                    lng: (lng && !isNaN(parseFloat(lng))) ? parseFloat(lng) : 0,
                    keywords: transcript || "",
                    embedding: embedding || []
                }
            });

            console.log("Saved as UnknownSample:", result.id, "cluster:", cluster_id);

            return NextResponse.json({
                success: true,
                type: "unknown",
                id: result.id,
                clusterId: cluster_id,
                message: "Recording saved as unknown language sample"
            }, { status: 200 });
        }

    } catch (err) {
        console.error("Save recording error:", err);
        return NextResponse.json({
            success: false,
            error: "Failed to save recording",
            details: err.message
        }, { status: 500 });
    }
}