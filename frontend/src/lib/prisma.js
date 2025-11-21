import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@prisma/client"; 
const globalForPrisma = globalThis.__prisma || {};

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma =
    globalForPrisma.client ||
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = { client: prisma };
}

export default prisma;
