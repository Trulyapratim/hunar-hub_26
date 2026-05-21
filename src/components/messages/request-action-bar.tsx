"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequestActionBarProps = {
  conversationId: string;
  onAccepted: () => void;
  onDeclined: () => void;
};

/**
 * Sticky Accept / Decline controls shown to the receiver of a pending request.
 */
export function RequestActionBar({
  conversationId,
  onAccepted,
  onDeclined,
}: RequestActionBarProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  const handleAccept = async () => {
    setLoading("accept");
    try {
      const res = await fetch(`/api/conversations/${conversationId}/accept`, {
        method: "POST",
      });
      if (res.ok) onAccepted();
    } finally {
      setLoading(null);
    }
  };

  const handleDecline = async () => {
    setLoading("decline");
    try {
      const res = await fetch(`/api/conversations/${conversationId}/decline`, {
        method: "POST",
      });
      if (res.ok) onDeclined();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-amber-400/30 bg-gradient-to-t from-amber-50 via-amber-50/95 to-transparent p-4 backdrop-blur-sm dark:from-amber-950/80 dark:via-amber-950/60">
      <p className="mb-3 text-center text-sm font-medium text-amber-900 dark:text-amber-100">
        Accept this skill exchange request to start chatting
      </p>
      <div className="flex gap-3">
        <Button
          size="lg"
          className="h-12 flex-1 bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700"
          onClick={handleAccept}
          disabled={loading !== null}
        >
          {loading === "accept" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <Check className="mr-2 size-5" />
              Accept Request
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1 border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
          onClick={handleDecline}
          disabled={loading !== null}
        >
          {loading === "decline" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <X className="mr-2 size-5" />
              Decline
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
