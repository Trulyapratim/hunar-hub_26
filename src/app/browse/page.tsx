/**
 * Browse dashboard — skill-matching discovery with Suspense streaming.
 */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllSkillNames } from "@/lib/matching";
import { AppHeader } from "@/components/layout/app-header";
import { BrowseFilters } from "@/components/browse/browse-filters";
import { MatchGrid } from "@/components/browse/match-grid";
import { BrowseGridSkeleton } from "@/components/browse/browse-skeleton";
import type { BrowseSortOption } from "@/lib/matching/types";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Browse matches",
  description: "Discover peers who can teach you skills — and learn from you.",
};

type BrowsePageProps = {
  searchParams: Promise<{ skill?: string; sort?: string }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/browse");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const filterKey = `${params.skill ?? ""}-${params.sort ?? "match"}`;
  const skillQuery = params.skill?.trim() ?? "";
  const sortParam = params.sort;
  const sortBy: BrowseSortOption =
    sortParam === "rating" || sortParam === "university"
      ? sortParam
      : "match";

  const suggestedSkills = await getAllSkillNames();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/80 via-background to-indigo-50/40 dark:from-violet-950/30 dark:to-indigo-950/20">
      <AppHeader activePath="/browse" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-10 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-300/50 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800 dark:text-violet-200">
            <Sparkles className="size-3.5" />
            Smart matching
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find your next{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              skill exchange
            </span>
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            We surface peers where you can learn from each other — perfect
            matches swap skills both ways; teacher matches connect you with
            someone who can teach what you need.
          </p>
        </section>

        <div className="space-y-8">
          <BrowseFilters
            suggestedSkills={suggestedSkills}
            defaultSkill={skillQuery}
            defaultSort={sortBy}
          />

          <Suspense key={filterKey} fallback={<BrowseGridSkeleton />}>
            <MatchGrid searchParams={params} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
