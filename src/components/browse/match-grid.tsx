import { auth } from "@/lib/auth";
import { findMatchesForUser } from "@/lib/matching";
import { MatchType, type BrowseSortOption } from "@/lib/matching/types";
import { UserCard } from "@/components/browse/user-card";
import { Badge } from "@/components/ui/badge";
import { Users, Zap } from "lucide-react";

type MatchGridProps = {
  searchParams: {
    skill?: string;
    sort?: string;
  };
};

/**
 * Async server component — fetches and renders only the match grid + stats.
 * Filters remain mounted outside Suspense for smoother UX.
 */
export async function MatchGrid({ searchParams }: MatchGridProps) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const skillQuery = searchParams.skill?.trim() ?? "";
  const sortParam = searchParams.sort;
  const sortBy: BrowseSortOption =
    sortParam === "rating" || sortParam === "university"
      ? sortParam
      : "match";

  const { peers, currentUser } = await findMatchesForUser(session.user.id, {
    skillQuery,
    sortBy,
  });

  const perfectCount = peers.filter(
    (p) => p.matchType === MatchType.PERFECT_MATCH
  ).length;
  const teacherCount = peers.filter(
    (p) => p.matchType === MatchType.TEACHER_MATCH
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Users className="size-3.5" />
          {peers.length} {peers.length === 1 ? "match" : "matches"}
        </Badge>
        {perfectCount > 0 && (
          <Badge className="gap-1.5 border-0 bg-amber-500/15 text-amber-800 dark:text-amber-300">
            <Zap className="size-3.5" />
            {perfectCount} perfect
          </Badge>
        )}
        {teacherCount > 0 && (
          <Badge className="gap-1.5 border-0 bg-violet-500/15 text-violet-800 dark:text-violet-300">
            {teacherCount} teacher
          </Badge>
        )}
        {currentUser.university && (
          <span className="text-sm text-muted-foreground">
            Campus: {currentUser.university}
          </span>
        )}
      </div>

      {peers.length === 0 ? (
        <EmptyMatches skillQuery={skillQuery} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {peers.map((peer) => (
            <UserCard key={peer.id} peer={peer} />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyMatches({ skillQuery }: { skillQuery: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <Users className="mx-auto mb-4 size-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">No matches found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {skillQuery
          ? `No peers match "${skillQuery}" with a teach/learn overlap. Try another skill or invite classmates to join.`
          : "No skill overlaps yet. Complete your profile tags or check back when more students join your campus."}
      </p>
    </div>
  );
}
