/**
 * Database seed — populates the Skill catalog with common tags.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { SKILL_SUGGESTIONS } from "../src/lib/constants/skills";

const prisma = new PrismaClient();

async function main() {
  for (const [category, skills] of Object.entries(SKILL_SUGGESTIONS)) {
    for (const name of skills) {
      await prisma.skill.upsert({
        where: { name },
        update: { category },
        create: { name, category },
      });
    }
  }
  console.log("Seeded skills catalog.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
