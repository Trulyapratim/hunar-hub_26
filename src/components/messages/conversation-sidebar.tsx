"use client";

import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatMessageTime,
  truncatePreview,
} from "@/lib/messaging/format";
import type { ConversationListItem } from "@/lib/messaging/types";
import { ConversationStatus } from "@prisma/client";

type ConversationSidebarProps = {
  conversations: ConversationListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
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

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  isLoading,
}: ConversationSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r bg-muted/20">
      <div className="border-b bg-card/50 px-4 py-4">
        <h2 className="text-lg font-bold">Messages</h2>
        <p className="text-xs text-muted-foreground">
          Skill exchanges & chats
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <MessageCircle className="size-10 opacity-40" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">
              Send a request from Browse to start connecting
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {conversations.map((conv) => {
              const photo =
                conv.otherParticipant.avatar ??
                conv.otherParticipant.image;
              const isActive = conv.id === activeId;
              const preview = conv.lastMessage?.content ?? "No messages yet";
              const previewTime = conv.lastMessage
                ? formatMessageTime(conv.lastMessage.createdAt)
                : "";

              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                      isActive && "bg-violet-500/10 hover:bg-violet-500/15"
                    )}
                  >
                    <Avatar className="size-12 shrink-0">
                      {photo ? (
                        <AvatarImage
                          src={photo}
                          alt={conv.otherParticipant.name ?? ""}
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-sm text-white">
                        {getInitials(conv.otherParticipant.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">
                          {conv.otherParticipant.name ?? "Student"}
                        </span>
                        {previewTime && (
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {previewTime}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {truncatePreview(preview)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {conv.unreadRequest && (
                          <Badge className="h-5 border-0 bg-amber-500 px-1.5 text-[10px] text-white">
                            Request
                          </Badge>
                        )}
                        {conv.status === ConversationStatus.PENDING &&
                          !conv.unreadRequest && (
                            <Badge variant="secondary" className="h-5 text-[10px]">
                              Pending
                            </Badge>
                          )}
                        {conv.status === ConversationStatus.DECLINED && (
                          <Badge variant="outline" className="h-5 text-[10px]">
                            Declined
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
