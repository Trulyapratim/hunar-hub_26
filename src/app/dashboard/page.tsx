/**
 * Profile dashboard — summary of the logged-in user's skills.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillType } from "@prisma/client";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Profile",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userSkills: { include: { skill: true } },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const canTeach = user.userSkills.filter(
    (us) => us.skillType === SkillType.CAN_TEACH
  );
  const wantsToLearn = user.userSkills.filter(
    (us) => us.skillType === SkillType.WANTS_TO_LEARN
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activePath="/dashboard" />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Hey, {user.name?.split(" ")[0] ?? "student"}!
            </h1>
            <p className="mt-1 text-muted-foreground">{user.university}</p>
          </div>
          <Link
            href="/browse"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
          >
            <Sparkles className="size-4" />
            Browse matches
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400">
                I can teach
              </CardTitle>
              <CardDescription>Skills you offer to peers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {canTeach.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills yet.</p>
              ) : (
                canTeach.map((us) => (
                  <Badge key={us.id} variant="secondary">
                    {us.skill.name}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-violet-700 dark:text-violet-300">
                I want to learn
              </CardTitle>
              <CardDescription>Skills you are seeking help with</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {wantsToLearn.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills yet.</p>
              ) : (
                wantsToLearn.map((us) => (
                  <Badge key={us.id} variant="outline">
                    {us.skill.name}
                  </Badge>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-violet-500/20 bg-violet-500/5">
          <CardHeader>
            <CardTitle>Ready to connect?</CardTitle>
            <CardDescription>
              Head to Browse to see perfect and teacher matches based on your
              skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Edit profile — coming soon
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
