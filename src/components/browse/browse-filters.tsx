"use client";

/**
 * Client-side filter controls — updates URL search params so the server
 * Suspense boundary re-fetches matches with new filters.
 */
import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrowseSortOption } from "@/lib/matching/types";

type BrowseFiltersProps = {
  suggestedSkills: string[];
  defaultSkill?: string;
  defaultSort?: BrowseSortOption;
};

export function BrowseFilters({
  suggestedSkills,
  defaultSkill = "",
  defaultSort = "match",
}: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const skill = searchParams.get("skill") ?? defaultSkill;
  const sort = (searchParams.get("sort") as BrowseSortOption) ?? defaultSort;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-violet-500/15 bg-card/60 p-4 shadow-sm backdrop-blur-md transition-opacity sm:flex-row sm:items-end ${isPending ? "opacity-70" : ""}`}
    >
      <div className="relative flex-1 space-y-2">
        <Label htmlFor="skill-search" className="flex items-center gap-1.5">
          <Search className="size-3.5" />
          Filter by skill
        </Label>
        <Input
          id="skill-search"
          list="skill-suggestions"
          placeholder="e.g. React, Java, DSA, C++"
          value={skill}
          onChange={(e) => updateParams({ skill: e.target.value })}
        />
        <datalist id="skill-suggestions">
          {suggestedSkills.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2 sm:w-48">
        <Label className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          Sort by
        </Label>
        <Select
          value={sort}
          onValueChange={(value) =>
            updateParams({ sort: (value as BrowseSortOption) ?? "match" })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best match</SelectItem>
            <SelectItem value="university">My university first</SelectItem>
            <SelectItem value="rating">Highest rating</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
