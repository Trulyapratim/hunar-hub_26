"use client";

import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging/format";
import type { MessageDTO } from "@/lib/messaging/types";

type MessageBubbleProps = {
  message: MessageDTO;
  isOwn: boolean;
};

/**
 * WhatsApp-style chat bubble — own messages align right (violet), others left (muted).
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isRequest = message.isRequestMode;

  return (
    <div
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%]",
          isOwn
            ? "rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
            : "rounded-bl-md border bg-card text-card-foreground",
          isRequest &&
            !isOwn &&
            "border-amber-400/50 bg-amber-50 ring-2 ring-amber-400/20 dark:bg-amber-950/30"
        )}
      >
        {isRequest && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
            Skill exchange request
          </p>
        )}
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {message.content}
        </p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            isOwn ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
