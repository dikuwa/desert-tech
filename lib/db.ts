import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

let db: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const globalForPrisma = global as unknown as { prisma: PrismaClient };

    db = globalForPrisma.prisma || new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = db;
    }
  } else {
    console.log(
      "[db] DATABASE_URL not set — running without database. Dashboard will use in-memory store.",
    );
  }
} catch (error) {
  console.warn("[db] Failed to initialize database:", error);
  db = null;
}

export { db };
