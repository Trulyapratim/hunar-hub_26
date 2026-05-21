"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  conversationId: string;
  onSent: (content: string) => void;
  disabled?: boolean;
};

/** WhatsApp-style composer — unlocked after request is accepted. */
export function ChatInput({
  conversationId,
  onSent,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed }),
        }
      );

      if (res.ok) {
        setText("");
        onSent(trimmed);
      }
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t bg-card/80 p-3 backdrop-blur-md">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
        disabled={disabled || isSending}
        rows={1}
        className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border-muted bg-muted/50 py-2.5"
      />
      <Button
        type="button"
        size="icon"
        className="size-11 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
        onClick={send}
        disabled={disabled || isSending || !text.trim()}
        aria-label="Send message"
      >
        {isSending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Send className="size-5" />
        )}
      </Button>
    </div>
  );
}
