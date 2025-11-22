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
    const samples = await prisma.unknownSample.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\nLast 5 samples:`);
    console.log("---------------------------------------------------");
    samples.forEach(s => {
      console.log(`ID: ${s.id}`);
      console.log(`  Region: ${s.region}`);
      console.log(`  Lat: ${s.lat}`);
      console.log(`  Lng: ${s.lng}`);
      console.log(`  Created: ${s.createdAt.toISOString()}`);
      console.log("---------------------------------------------------");
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
