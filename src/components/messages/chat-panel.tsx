"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "@/components/messages/message-bubble";
import { RequestActionBar } from "@/components/messages/request-action-bar";
import { ChatInput } from "@/components/messages/chat-input";
import type { ConversationDetail } from "@/lib/messaging/types";
import { ConversationStatus } from "@prisma/client";

type ChatPanelProps = {
  conversation: ConversationDetail | null;
  currentUserId: string;
  isLoading?: boolean;
  onRefresh: () => void;
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ChatPanel({
  conversation,
  currentUserId,
  isLoading,
  onRefresh,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  if (!conversation && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#e5ddd5]/30 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%239C92AC%22 fill-opacity%3D%220.06%22%3E%3Cpath d%3D%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] dark:bg-muted/20">
        <MessageSquare className="mb-4 size-16 text-muted-foreground/30" />
        <p className="text-lg font-medium text-muted-foreground">
          Select a conversation
        </p>
        <p className="mt-1 text-sm text-muted-foreground/80">
          Pick a chat from the sidebar or send a request from Browse
        </p>
      </div>
    );
  }

  if (isLoading || !conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading conversation…</p>
      </div>
    );
  }

  const peer = conversation.otherParticipant;
  const photo = peer.avatar ?? peer.image;
  const showRequestActions = conversation.isReceiverOfPendingRequest;
  const showComposer = conversation.canSendMessages;
  const isDeclined = conversation.status === ConversationStatus.DECLINED;
  const isPendingSender =
    conversation.status === ConversationStatus.PENDING &&
    conversation.initiatedById === currentUserId;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b bg-card/90 px-4 py-3 backdrop-blur">
        <Avatar className="size-10">
          {photo ? (
            <AvatarImage src={photo} alt={peer.name ?? ""} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-sm text-white">
            {getInitials(peer.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{peer.name ?? "Student"}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {peer.university ?? "HunarHub"}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-[#e5ddd5]/40 p-4 dark:bg-muted/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {conversation.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
      </div>

      {showRequestActions && (
        <RequestActionBar
          conversationId={conversation.id}
          onAccepted={onRefresh}
          onDeclined={onRefresh}
        />
      )}

      {isPendingSender && !showRequestActions && (
        <div className="border-t bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          Waiting for them to accept your request…
        </div>
      )}

      {isDeclined && (
        <div className="border-t bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          This request was declined.
        </div>
      )}

      {showComposer && (
        <ChatInput
          conversationId={conversation.id}
          onSent={() => onRefresh()}
        />
      )}
    </div>
  );
}
