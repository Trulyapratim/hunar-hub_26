/**
 * Onboarding page — shown to first-time users after Google OAuth.
 * Middleware redirects here when `user.university` is null.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata = {
  title: "Complete your profile | HunarHub",
  description: "Set up your university and skills to start matching with peers.",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/onboarding");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-background to-indigo-50/50 px-4 py-12 dark:from-violet-950/20 dark:to-indigo-950/10">
      <OnboardingForm />
    </div>
  );
}
