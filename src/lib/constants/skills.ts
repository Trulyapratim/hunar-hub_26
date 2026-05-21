/**
 * Suggested skill tags grouped by category for the onboarding UI.
 * Users can also type custom skills — these are quick-pick shortcuts.
 */
export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  Programming: [
    "JavaScript",
    "TypeScript",
    "Python",
    "React",
    "Next.js",
    "Node.js",
    "Java",
    "C",
    "C++",
    "DSA",
  ],
  Design: ["Figma", "UI/UX", "Graphic Design", "Prototyping"],
  Academics: ["Calculus", "Linear Algebra", "Physics", "Organic Chemistry"],
  Languages: ["English", "Hindi", "Spanish", "French", "German"],
  Career: ["Resume Writing", "Interview Prep", "Public Speaking"],
};

export const ALL_SUGGESTED_SKILLS = Object.values(SKILL_SUGGESTIONS).flat();
