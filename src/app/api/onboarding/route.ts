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
  console.log("[onboarding-api] ===== POST /api/onboarding called =====");
  
  try {
    const session = await auth();
    console.log("[onboarding-api] Session retrieved:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.error("[onboarding-api] No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
      console.log("[onboarding-api] Request body parsed:", body);
    } catch (err) {
      console.error("[onboarding-api] Failed to parse JSON:", err);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[onboarding-api] Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { university, canTeach, wantsToLearn } = parsed.data;
    const userId = session.user.id;

    console.log("[onboarding-api] Starting onboarding for user:", {
      userId,
      university,
      canTeachCount: canTeach.length,
      wantsToLearnCount: wantsToLearn.length,
    });

    try {
      console.log("[onboarding-api] Updating user with university...");
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { university },
        });
      });
      console.log("[onboarding-api] User updated successfully");

      console.log("[onboarding-api] Replacing CAN_TEACH skills...");
      await replaceUserSkills(userId, canTeach, SkillType.CAN_TEACH);
      console.log("[onboarding-api] CAN_TEACH skills saved");

      console.log("[onboarding-api] Replacing WANTS_TO_LEARN skills...");
      await replaceUserSkills(userId, wantsToLearn, SkillType.WANTS_TO_LEARN);
      console.log("[onboarding-api] WANTS_TO_LEARN skills saved");

      console.log("[onboarding-api] ===== Onboarding completed successfully =====");
      const response = { success: true };
      console.log("[onboarding-api] Sending response:", response);
      return NextResponse.json(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";
      console.error("[onboarding-api] Error during database operations:", {
        message: errorMsg,
        stack: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error,
      });
      console.error("[onboarding-api] Full error object:", error);
      
      return NextResponse.json(
        { error: `Failed to save onboarding data: ${errorMsg}` },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[onboarding-api] ===== UNEXPECTED ERROR =====");
    console.error("[onboarding-api] Message:", errorMsg);
    console.error("[onboarding-api] Stack:", errorStack);
    console.error("[onboarding-api] Full error:", error);
    
    return NextResponse.json(
      { error: `Unexpected error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
