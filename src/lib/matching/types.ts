/**
 * Types for the HunarHub skill-matching engine.
 *
 * Match semantics (logged-in user = A, candidate = B):
 * - PERFECT_MATCH: A wants skills B teaches AND B wants skills A teaches (mutual exchange).
 * - TEACHER_MATCH: A wants skills B teaches, but B does not want skills A teaches (one-way).
 * - NONE: No overlapping teach/learn pairing.
 */

export const MatchType = {
  PERFECT_MATCH: "PERFECT_MATCH",
  TEACHER_MATCH: "TEACHER_MATCH",
  NONE: "NONE",
} as const;

export type MatchType = (typeof MatchType)[keyof typeof MatchType];

/** Skills that form the basis of the match between two users. */
export type MatchOverlap = {
  /** Skills B can teach that A wants to learn. */
  theyCanTeachYou: string[];
  /** Skills B wants to learn that A can teach (only for perfect matches). */
  youCanTeachThem: string[];
};

/** A peer user enriched with match metadata for the browse UI. */
export type MatchedPeer = {
  id: string;
  name: string | null;
  avatar: string | null;
  image: string | null;
  university: string | null;
  bio: string | null;
  totalRating: number;
  matchType: MatchType;
  overlap: MatchOverlap;
  /** Full skill lists for card tag display. */
  canTeach: string[];
  wantsToLearn: string[];
  /** Same university as the logged-in user. */
  isSameUniversity: boolean;
};

export type BrowseSortOption = "match" | "rating" | "university";

export type FindMatchesOptions = {
  /** Case-insensitive skill name filter (partial match). */
  skillQuery?: string;
  sortBy?: BrowseSortOption;
  /** When true, include users with no skill overlap. Default false. */
  includeUnmatched?: boolean;
};

export type CurrentUserSkills = {
  userId: string;
  university: string | null;
  canTeach: string[];
  wantsToLearn: string[];
};
