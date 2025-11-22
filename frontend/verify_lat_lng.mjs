import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Verifying lat/lng storage...");
    
    const testLat = 12.9716;
    const testLng = 77.5946;
    
    // Create a test sample
    const sample = await prisma.unknownSample.create({
      data: {
        fileUrl: "test_url",
        confidence: 0.5,
        region: `${testLat},${testLng}`,
        lat: testLat,
        lng: testLng,
        keywords: "test",
        embedding: []
      }
    });
    
    console.log(`Created sample ID: ${sample.id}`);
    
    // Fetch it back
    const fetched = await prisma.unknownSample.findUnique({
      where: { id: sample.id }
    });
    
    console.log("Fetched sample:", fetched);
    
    if (fetched.lat === testLat && fetched.lng === testLng) {
      console.log("SUCCESS: lat and lng stored correctly!");
    } else {
      console.error("FAILURE: lat/lng mismatch!");
      console.error(`Expected: ${testLat}, ${testLng}`);
      console.error(`Got: ${fetched.lat}, ${fetched.lng}`);
    }
    
    // Cleanup
    await prisma.unknownSample.delete({
      where: { id: sample.id }
    });
    console.log("Test sample deleted.");
    
  } catch (e) {
    console.error("Error during verification:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
