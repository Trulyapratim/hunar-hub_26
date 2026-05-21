/**
 * Pure functions that classify a peer match from two users' skill sets.
 * Kept separate from DB access so logic is unit-testable.
 */
import {
  MatchType,
  type CurrentUserSkills,
  type MatchOverlap,
  type MatchedPeer,
} from "@/lib/matching/types";

type PeerSkillProfile = {
  id: string;
  name: string | null;
  avatar: string | null;
  image: string | null;
  university: string | null;
  bio: string | null;
  totalRating: number;
  canTeach: string[];
  wantsToLearn: string[];
};

function normalize(skill: string): string {
  return skill.trim().toLowerCase();
}

function intersect(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(normalize));
  const seen = new Set<string>();
  const result: string[] = [];

  for (const skill of a) {
    const key = normalize(skill);
    if (setB.has(key) && !seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
  }
  return result;
}

/**
 * Determines match type and overlapping skills between the current user and a peer.
 */
export function computeMatch(
  current: CurrentUserSkills,
  peer: PeerSkillProfile
): Pick<MatchedPeer, "matchType" | "overlap"> {
  const theyCanTeachYou = intersect(current.wantsToLearn, peer.canTeach);
  const youCanTeachThem = intersect(current.canTeach, peer.wantsToLearn);

  const overlap: MatchOverlap = {
    theyCanTeachYou,
    youCanTeachThem,
  };

  if (theyCanTeachYou.length > 0 && youCanTeachThem.length > 0) {
    return { matchType: MatchType.PERFECT_MATCH, overlap };
  }

  if (theyCanTeachYou.length > 0) {
    return { matchType: MatchType.TEACHER_MATCH, overlap };
  }

  return { matchType: MatchType.NONE, overlap };
}

/** Numeric priority for sorting (higher = better match). */
export function matchTypePriority(matchType: MatchType): number {
  switch (matchType) {
    case MatchType.PERFECT_MATCH:
      return 2;
    case MatchType.TEACHER_MATCH:
      return 1;
    default:
      return 0;
  }
}

export function buildMatchedPeer(
  current: CurrentUserSkills,
  peer: PeerSkillProfile
): MatchedPeer {
  const { matchType, overlap } = computeMatch(current, peer);

  return {
    id: peer.id,
    name: peer.name,
    avatar: peer.avatar,
    image: peer.image,
    university: peer.university,
    bio: peer.bio,
    totalRating: peer.totalRating,
    matchType,
    overlap,
    canTeach: peer.canTeach,
    wantsToLearn: peer.wantsToLearn,
    isSameUniversity:
      Boolean(current.university) &&
      Boolean(peer.university) &&
      normalize(current.university!) === normalize(peer.university!),
  };
}

/**
 * Filters peers by skill query (matches name in teach, learn, or overlap lists).
 */
export function peerMatchesSkillQuery(peer: MatchedPeer, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  const haystack = [
    ...peer.canTeach,
    ...peer.wantsToLearn,
    ...peer.overlap.theyCanTeachYou,
    ...peer.overlap.youCanTeachThem,
  ];

  return haystack.some((s) => normalize(s).includes(q));
}
