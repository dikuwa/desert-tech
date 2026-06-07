import dotenv from "dotenv";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { ensureSystemUsers, SYSTEM_USERS } from "../lib/system-users";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[system-users] DATABASE_URL is not configured; skipping bootstrap.");
    return;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const resetPasswords = process.env.RESET_SYSTEM_USER_PASSWORDS === "true";

  try {
    await ensureSystemUsers(prisma, { resetPasswords });
    console.log(
      `[system-users] Ready: ${SYSTEM_USERS.map((user) => `${user.email} (${user.role})`).join(", ")}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[system-users] Bootstrap failed:", error);
  process.exit(1);
});
