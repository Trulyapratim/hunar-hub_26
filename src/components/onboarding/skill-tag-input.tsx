"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SkillTagInputProps = {
  id: string;
  label: string;
  description: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  accentClassName?: string;
};

export function SkillTagInput({
  id,
  label,
  description,
  value,
  onChange,
  suggestions = [],
  accentClassName = "bg-primary/10 text-primary border-primary/20",
}: SkillTagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(draft);
    }
  };

  const availableSuggestions = suggestions.filter(
    (s) => !value.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id} className="text-base font-semibold">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a skill and press Enter"
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => addTag(draft)}
          aria-label="Add skill"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`gap-1 pr-1 ${accentClassName}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick add
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 8).map((skill) => (
              <Button
                key={skill}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addTag(skill)}
              >
                + {skill}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
