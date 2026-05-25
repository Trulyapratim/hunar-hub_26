"use client";

/**
 * Unified messaging shell — sidebar + chat panel with Socket.io live updates.
 */
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationSidebar } from "@/components/messages/conversation-sidebar";
import { ChatPanel } from "@/components/messages/chat-panel";
import { useSocket } from "@/hooks/use-socket";
import type {
  ConversationDetail,
  ConversationListItem,
  MessageDTO,
} from "@/lib/messaging/types";
import type {
  SocketConversationUpdatedPayload,
  SocketMessagePayload,
} from "@/lib/socket/events";
import { ConversationStatus } from "@prisma/client";

export function MessagesApp() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("c");

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [activeConversation, setActiveConversation] =
    useState<ConversationDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const userId = session?.user?.id;

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (!res.ok) return;
    const data = await res.json();
    setConversations(data.conversations);
    setListLoading(false);
  }, []);

  const fetchConversation = useCallback(async (id: string) => {
    setChatLoading(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) {
        setActiveConversation(null);
        return;
      }
      const data = await res.json();
      setActiveConversation(data.conversation);
    } finally {
      setChatLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchConversations();
    if (activeId) await fetchConversation(activeId);
  }, [activeId, fetchConversations, fetchConversation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchConversations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeId) {
        fetchConversation(activeId);
      } else {
        setActiveConversation(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeId, fetchConversation]);

  const handleSocketMessage = useCallback(
    (payload: SocketMessagePayload) => {
      const { conversationId, message } = payload;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: {
                  content: message.content,
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                  isRequestMode: message.isRequestMode,
                },
                updatedAt: message.createdAt,
              }
            : c
        )
      );

      if (activeId === conversationId) {
        setActiveConversation((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === message.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message as MessageDTO],
          };
        });
      } else {
        fetchConversations();
      }
    },
    [activeId, fetchConversations]
  );

  const handleConversationUpdated = useCallback(
    (payload: SocketConversationUpdatedPayload) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                status: payload.status,
                unreadRequest:
                  payload.status === ConversationStatus.PENDING &&
                  c.initiatedById !== userId,
              }
            : c
        )
      );

      if (activeId === payload.conversationId) {
        fetchConversation(payload.conversationId);
      }
    },
    [activeId, fetchConversation, userId]
  );

  useSocket({
    userId,
    activeConversationId: activeId,
    onMessage: handleSocketMessage,
    onConversationUpdated: handleConversationUpdated,
  });

  const selectConversation = (id: string) => {
    router.push(`/messages?c=${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      <div
        className={`w-full shrink-0 border-r md:w-80 lg:w-96 ${activeId ? "hidden md:flex md:flex-col" : "flex flex-col"}`}
      >
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          isLoading={listLoading}
        />
      </div>
      <div
        className={`min-w-0 flex-1 ${activeId ? "flex" : "hidden md:flex"}`}
      >
        <ChatPanel
          conversation={activeConversation}
          currentUserId={userId ?? ""}
          isLoading={chatLoading}
          onRefresh={refreshAll}
        />
      </div>
    </div>
  );
}
