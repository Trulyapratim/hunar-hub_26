"use client";

/**
 * Silently creates a skill-exchange request conversation, then navigates to /messages.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SendRequestButtonProps = {
  peerId: string;
  className?: string;
};

export function SendRequestButton({ peerId, className }: SendRequestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/conversations/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error);
        return;
      }

      router.push(`/messages?c=${data.conversationId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      className={cn(
        "w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Send className="size-4" />
      )}
      Send Request
    </Button>
  );
}
