import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
};

/** Displays a compact star row from `totalRating` (0–5 scale). */
export function StarRating({ rating, max = 5, className }: StarRatingProps) {
  const clamped = Math.min(max, Math.max(0, rating));

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(clamped);
        const half = !filled && i < clamped;

        return (
          <Star
            key={i}
            className={cn(
              "size-4",
              filled
                ? "fill-amber-400 text-amber-400"
                : half
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-muted-foreground/30"
            )}
          />
        );
      })}
      <span className="ml-1 text-sm font-medium tabular-nums text-muted-foreground">
        {clamped > 0 ? clamped.toFixed(1) : "New"}
      </span>
    </div>
  );
}
