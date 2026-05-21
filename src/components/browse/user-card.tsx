import { GraduationCap, Sparkles, ArrowRightLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SendRequestButton } from "@/components/messages/send-request-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/browse/star-rating";
import { MatchType, type MatchedPeer } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

type UserCardProps = {
  peer: MatchedPeer;
  className?: string;
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MatchBadge({ matchType }: { matchType: MatchedPeer["matchType"] }) {
  if (matchType === MatchType.PERFECT_MATCH) {
    return (
      <Badge className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-lg shadow-amber-500/30">
        <Sparkles className="mr-1 size-3.5" />
        PERFECT MATCH
      </Badge>
    );
  }

  if (matchType === MatchType.TEACHER_MATCH) {
    return (
      <Badge className="border-0 bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-lg shadow-violet-500/30">
        <ArrowRightLeft className="mr-1 size-3.5" />
        TEACHER MATCH
      </Badge>
    );
  }

  return null;
}

/**
 * Reusable peer profile card for the browse dashboard.
 * Highlights match type, overlapping skills, and full skill tags.
 */
export function UserCard({ peer, className }: UserCardProps) {
  const photo = peer.avatar ?? peer.image;
  const highlightTeach = new Set(
    peer.overlap.theyCanTeachYou.map((s) => s.toLowerCase())
  );
  const highlightLearn = new Set(
    peer.overlap.youCanTeachThem.map((s) => s.toLowerCase())
  );

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10",
        peer.matchType === MatchType.PERFECT_MATCH &&
          "ring-2 ring-amber-400/40 ring-offset-2 ring-offset-background",
        peer.matchType === MatchType.TEACHER_MATCH &&
          "ring-2 ring-violet-400/30 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {peer.matchType !== MatchType.NONE && (
        <div className="absolute right-4 top-4 z-10">
          <MatchBadge matchType={peer.matchType} />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-80",
          peer.matchType === MatchType.PERFECT_MATCH
            ? "from-amber-500/20 via-orange-500/10 to-transparent"
            : peer.matchType === MatchType.TEACHER_MATCH
              ? "from-violet-600/20 via-indigo-500/10 to-transparent"
              : "from-muted/50 to-transparent"
        )}
      />

      <CardHeader className="relative pb-2 pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 border-2 border-background shadow-md">
            {photo ? (
              <AvatarImage src={photo} alt={peer.name ?? "User"} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-semibold text-white">
              {getInitials(peer.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1 pr-24">
            <h3 className="truncate text-lg font-bold leading-tight">
              {peer.name ?? "Anonymous Student"}
            </h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="size-3.5 shrink-0" />
              <span className="truncate">
                {peer.university ?? "University not set"}
              </span>
              {peer.isSameUniversity && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  Your campus
                </Badge>
              )}
            </p>
            <StarRating rating={peer.totalRating} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {peer.bio && (
          <CardDescription className="line-clamp-2 text-sm">
            {peer.bio}
          </CardDescription>
        )}

        {peer.overlap.theyCanTeachYou.length > 0 && (
          <SkillRow
            label="Can teach you"
            skills={peer.overlap.theyCanTeachYou}
            variant="teach"
          />
        )}

        {peer.overlap.youCanTeachThem.length > 0 && (
          <SkillRow
            label="Wants to learn from you"
            skills={peer.overlap.youCanTeachThem}
            variant="learn"
          />
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            All skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {peer.canTeach.map((skill) => (
              <Badge
                key={`teach-${skill}`}
                variant="secondary"
                className={cn(
                  "text-xs",
                  highlightTeach.has(skill.toLowerCase()) &&
                    "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/40 dark:text-emerald-300"
                )}
              >
                {skill}
              </Badge>
            ))}
            {peer.wantsToLearn.map((skill) => (
              <Badge
                key={`learn-${skill}`}
                variant="outline"
                className={cn(
                  "text-xs",
                  highlightLearn.has(skill.toLowerCase()) &&
                    "bg-violet-500/15 text-violet-800 ring-1 ring-violet-500/40 dark:text-violet-300"
                )}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative border-t bg-muted/30 pt-4">
        <SendRequestButton peerId={peer.id} />
      </CardFooter>
    </Card>
  );
}

function SkillRow({
  label,
  skills,
  variant,
}: {
  label: string;
  skills: string[];
  variant: "teach" | "learn";
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge
            key={skill}
            className={cn(
              "text-xs font-medium",
              variant === "teach"
                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                : "bg-violet-500/15 text-violet-800 dark:text-violet-300"
            )}
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
