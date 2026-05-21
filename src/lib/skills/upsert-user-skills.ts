/**
 * Persists a user's skill tags as normalized Skill + UserSkill rows.
 *
 * Design:
 * - Skills are upserted by canonical name (case-insensitive) to avoid duplicates.
 * - Each tag becomes one UserSkill row with the given SkillType enum.
 * - Existing skills for this user/type are replaced on re-onboarding.
 */
import { prisma } from "@/lib/prisma";
import { SkillType } from "@prisma/client";
import { SKILL_SUGGESTIONS } from "@/lib/constants/skills";

function inferCategory(skillName: string): string {
  const normalized = skillName.toLowerCase();
  for (const [category, skills] of Object.entries(SKILL_SUGGESTIONS)) {
    if (skills.some((s) => s.toLowerCase() === normalized)) {
      return category;
    }
  }
  return "General";
}

async function upsertSkillByName(name: string, category?: string) {
  const trimmed = name.trim();
  const resolvedCategory = category ?? inferCategory(trimmed);

  const existing = await prisma.skill.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });

  if (existing) {
    return existing;
  }

  return prisma.skill.create({
    data: { name: trimmed, category: resolvedCategory },
  });
}

/**
 * Replaces all UserSkill rows for a user and skill type, then inserts new ones.
 */
export async function replaceUserSkills(
  userId: string,
  skillNames: string[],
  skillType: SkillType
) {
  await prisma.userSkill.deleteMany({
    where: { userId, skillType },
  });

  const uniqueNames = [
    ...new Set(skillNames.map((n) => n.trim()).filter(Boolean)),
  ];

  for (const rawName of uniqueNames) {
    const skill = await upsertSkillByName(rawName);
    await prisma.userSkill.create({
      data: {
        userId,
        skillId: skill.id,
        skillType,
      },
    });
  }
}
