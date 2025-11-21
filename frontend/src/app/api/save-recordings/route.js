import { NextResponse } from "next/server";
import { saveToDB } from "@/actions/bhasha";

export async function POST(req) {
    try {
        // Get the processed data from the request body
        const processedData = await req.json();

        console.log("Received processed data:", processedData);

        // Call the saveToDB function with the processed data
        const result = await saveToDB(processedData);

        console.log("Save to DB result:", result);

        return NextResponse.json(
            {
                success: true,
                message: "Recording saved successfully",
                data: result
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Save recording error:", err);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to save recording",
                details: err.message
            },
            { status: 500 }
        );
    }
}