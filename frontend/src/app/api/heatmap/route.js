import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const samples = await prisma.unknownSample.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: samples }, { status: 200 });
  } catch (err) {
    console.error("Heatmap fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}