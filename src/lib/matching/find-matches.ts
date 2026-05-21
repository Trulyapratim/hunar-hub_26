/**
 * HunarHub skill-matching engine — database queries + ranking.
 *
 * Algorithm:
 * 1. Load the logged-in user's CAN_TEACH and WANTS_TO_LEARN skill sets.
 * 2. Fetch all other onboarded users (university set) with their skills.
 * 3. For each peer, compute PERFECT_MATCH vs TEACHER_MATCH via set intersection.
 * 4. Apply optional skill filter and sort (match quality, rating, university).
 */
import { SkillType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildMatchedPeer,
  matchTypePriority,
  peerMatchesSkillQuery,
} from "@/lib/matching/compute-match";
import {
  MatchType,
  type BrowseSortOption,
  type CurrentUserSkills,
  type FindMatchesOptions,
  type MatchedPeer,
} from "@/lib/matching/types";

const userWithSkillsInclude = {
  userSkills: {
    include: { skill: true },
  },
} as const;

function splitSkills(
  userSkills: {
    skillType: SkillType;
    skill: { name: string };
  }[]
) {
  const canTeach: string[] = [];
  const wantsToLearn: string[] = [];

  for (const us of userSkills) {
    if (us.skillType === SkillType.CAN_TEACH) {
      canTeach.push(us.skill.name);
    } else {
      wantsToLearn.push(us.skill.name);
    }
  }

  return { canTeach, wantsToLearn };
}

async function loadCurrentUserSkills(
  userId: string
): Promise<CurrentUserSkills | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userWithSkillsInclude,
  });

  if (!user) return null;

  const { canTeach, wantsToLearn } = splitSkills(user.userSkills);

  return {
    userId: user.id,
    university: user.university,
    canTeach,
    wantsToLearn,
  };
}

/**
 * Primary entry point: returns ranked peer matches for the browse dashboard.
 */
export async function findMatchesForUser(
  userId: string,
  options: FindMatchesOptions = {}
): Promise<{
  currentUser: CurrentUserSkills;
  peers: MatchedPeer[];
  availableSkills: string[];
}> {
  const {
    skillQuery = "",
    sortBy = "match",
    includeUnmatched = false,
  } = options;

  const current = await loadCurrentUserSkills(userId);
  if (!current) {
    throw new Error("User not found");
  }

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      university: { not: null },
    },
    include: userWithSkillsInclude,
    orderBy: { totalRating: "desc" },
  });

  const skillNameSet = new Set<string>();

  let peers: MatchedPeer[] = candidates.map((candidate) => {
    const { canTeach, wantsToLearn } = splitSkills(candidate.userSkills);

    for (const s of [...canTeach, ...wantsToLearn]) {
      skillNameSet.add(s);
    }

    return buildMatchedPeer(current, {
      id: candidate.id,
      name: candidate.name,
      avatar: candidate.avatar,
      image: candidate.image,
      university: candidate.university,
      bio: candidate.bio,
      totalRating: candidate.totalRating,
      canTeach,
      wantsToLearn,
    });
  });

  if (!includeUnmatched) {
    peers = peers.filter((p) => p.matchType !== MatchType.NONE);
  }

  if (skillQuery.trim()) {
    peers = peers.filter((p) => peerMatchesSkillQuery(p, skillQuery));
  }

  peers = sortPeers(peers, sortBy, current.university);

  const availableSkills = [...skillNameSet].sort((a, b) =>
    a.localeCompare(b)
  );

  return { currentUser: current, peers, availableSkills };
}

function sortPeers(
  peers: MatchedPeer[],
  sortBy: BrowseSortOption,
  currentUniversity: string | null
): MatchedPeer[] {
  const normalizedUni = currentUniversity?.trim().toLowerCase() ?? "";

  return [...peers].sort((a, b) => {
    if (sortBy === "rating") {
      if (b.totalRating !== a.totalRating) {
        return b.totalRating - a.totalRating;
      }
      return matchTypePriority(b.matchType) - matchTypePriority(a.matchType);
    }

    if (sortBy === "university") {
      const aSame =
        normalizedUni &&
        a.university?.trim().toLowerCase() === normalizedUni
          ? 1
          : 0;
      const bSame =
        normalizedUni &&
        b.university?.trim().toLowerCase() === normalizedUni
          ? 1
          : 0;
      if (bSame !== aSame) return bSame - aSame;
      return matchTypePriority(b.matchType) - matchTypePriority(a.matchType);
    }

    // Default: match quality, then rating, then name
    const priorityDiff =
      matchTypePriority(b.matchType) - matchTypePriority(a.matchType);
    if (priorityDiff !== 0) return priorityDiff;

    const overlapDiff =
      b.overlap.theyCanTeachYou.length +
      b.overlap.youCanTeachThem.length -
      (a.overlap.theyCanTeachYou.length + a.overlap.youCanTeachThem.length);
    if (overlapDiff !== 0) return overlapDiff;

    if (b.totalRating !== a.totalRating) {
      return b.totalRating - a.totalRating;
    }

    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

/**
 * Loads distinct skill names across the platform for filter suggestions.
 */
export async function getAllSkillNames(): Promise<string[]> {
  const skills = await prisma.skill.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return skills.map((s) => s.name);
}
