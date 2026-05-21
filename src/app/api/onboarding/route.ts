/**
 * POST /api/onboarding
 *
 * Completes first-time user setup:
 * 1. Validates session (must be signed in via Google OAuth).
 * 2. Saves university on the User row (unlocks app routes via middleware).
 * 3. Creates UserSkill rows for CAN_TEACH and WANTS_TO_LEARN tags.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validators/onboarding";
import { replaceUserSkills } from "@/lib/skills/upsert-user-skills";
import { SkillType } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { university, canTeach, wantsToLearn } = parsed.data;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { university },
      });
    });

    await replaceUserSkills(userId, canTeach, SkillType.CAN_TEACH);
    await replaceUserSkills(userId, wantsToLearn, SkillType.WANTS_TO_LEARN);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[onboarding]", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
