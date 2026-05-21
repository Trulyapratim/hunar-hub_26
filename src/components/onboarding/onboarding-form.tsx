"use client";

/**
 * First-time user onboarding form.
 * Collects university + skill tags, then POSTs to /api/onboarding.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GraduationCap, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { SkillTagInput } from "@/components/onboarding/skill-tag-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIVERSITIES } from "@/lib/constants/universities";
import { ALL_SUGGESTED_SKILLS } from "@/lib/constants/skills";

export function OnboardingForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [university, setUniversity] = useState("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [canTeach, setCanTeach] = useState<string[]>([]);
  const [wantsToLearn, setWantsToLearn] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedUniversity =
    university === "Other" ? customUniversity.trim() : university;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log("[onboarding-form] Submitting with:", {
        university: resolvedUniversity,
        canTeachCount: canTeach.length,
        wantsToLearnCount: wantsToLearn.length,
      });

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university: resolvedUniversity,
          canTeach,
          wantsToLearn,
        }),
      });

      console.log("[onboarding-form] API response status:", res.status);

      const data = await res.json();
      console.log("[onboarding-form] API response data:", data);

      if (!res.ok) {
        const errorMsg = data.error ?? "Something went wrong. Please try again.";
        console.error("[onboarding-form] API error:", errorMsg);
        setError(errorMsg);
        return;
      }

      console.log("[onboarding-form] API success, updating session...");
      
      // Refresh session so middleware sees onboardingComplete.
      await update();
      
      console.log("[onboarding-form] Session updated, redirecting to /browse...");
      
      // Small delay to ensure session is truly updated
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      router.push("/browse");
      router.refresh();
      
      console.log("[onboarding-form] Redirect initiated");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      console.error("[onboarding-form] Exception caught:", {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        fullError: err,
      });
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
          <Sparkles className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to HunarHub, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Tell us where you study and what skills you can exchange with peers.
        </p>
      </div>

      <Card className="border-violet-500/20 shadow-xl shadow-violet-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-violet-600" />
            Your university
          </CardTitle>
          <CardDescription>
            We match you with students on your campus first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Select
              value={university}
              onValueChange={(value) => setUniversity(value ?? "")}
            >
              <SelectTrigger id="university" className="w-full">
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent>
                {UNIVERSITIES.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {university === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-university">University name</Label>
              <Input
                id="custom-university"
                value={customUniversity}
                onChange={(e) => setCustomUniversity(e.target.value)}
                placeholder="Enter your university"
                required
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <BookOpen className="size-5" />
            I can teach
          </CardTitle>
          <CardDescription>
            Skills you are confident teaching to fellow students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillTagInput
            id="can-teach"
            label="Teaching skills"
            description="Press Enter after each skill. Pick from suggestions or add your own."
            value={canTeach}
            onChange={setCanTeach}
            suggestions={ALL_SUGGESTED_SKILLS}
            accentClassName="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <Sparkles className="size-5" />
            I want to learn
          </CardTitle>
          <CardDescription>
            Skills you are looking for a peer mentor to help with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillTagInput
            id="wants-to-learn"
            label="Learning goals"
            description="What do you want a peer teacher for?"
            value={wantsToLearn}
            onChange={setWantsToLearn}
            suggestions={ALL_SUGGESTED_SKILLS}
            accentClassName="bg-violet-500/10 text-violet-700 border-violet-500/30 dark:text-violet-300"
          />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || !resolvedUniversity || canTeach.length === 0 || wantsToLearn.length === 0}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Setting up your profile...
          </>
        ) : (
          "Complete setup & start matching"
        )}
      </Button>
    </form>
  );
}
