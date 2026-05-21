/**
 * Prisma Client singleton for HunarHub.
 *
 * In development, Next.js hot-reloads modules and would otherwise create a new
 * PrismaClient on every reload — exhausting database connections. We attach the
 * client to `globalThis` so only one instance exists per process.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
