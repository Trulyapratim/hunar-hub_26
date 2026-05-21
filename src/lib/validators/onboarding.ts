/**
 * Zod schemas for onboarding API validation.
 * Keeps request parsing separate from route handlers for testability.
 */
import { z } from "zod";

export const onboardingSchema = z.object({
  university: z
    .string()
    .min(2, "Please select or enter your university")
    .max(120),
  canTeach: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Add at least one skill you can teach")
    .max(15),
  wantsToLearn: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Add at least one skill you want to learn")
    .max(15),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
