"use client";

/**
 * Socket.io client — connects once per session and joins user + conversation rooms.
 */
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import type {
  SocketConversationUpdatedPayload,
  SocketMessagePayload,
} from "@/lib/socket/events";

type UseSocketOptions = {
  userId: string | undefined;
  activeConversationId?: string | null;
  onMessage?: (payload: SocketMessagePayload) => void;
  onConversationUpdated?: (
    payload: SocketConversationUpdatedPayload
  ) => void;
};

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io({
      path: "/api/socket/io",
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
}

export function useSocket({
  userId,
  activeConversationId,
  onMessage,
  onConversationUpdated,
}: UseSocketOptions) {
  const onMessageRef = useRef(onMessage);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConversationUpdatedRef.current = onConversationUpdated;
  });

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.auth = { userId };
    if (!socket.connected) {
      socket.connect();
    }

    const handleMessage = (payload: SocketMessagePayload) => {
      onMessageRef.current?.(payload);
    };

    const handleConversationUpdated = (
      payload: SocketConversationUpdatedPayload
    ) => {
      onConversationUpdatedRef.current?.(payload);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleMessage);
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleMessage);
      socket.off(
        SOCKET_EVENTS.CONVERSATION_UPDATED,
        handleConversationUpdated
      );
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !activeConversationId) return;

    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, activeConversationId);
  }, [userId, activeConversationId]);

  return { socket: userId ? getSocket() : null };
}
