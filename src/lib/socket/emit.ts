/**
 * Emit real-time events to connected clients from API routes.
 */
import { getSocketServer } from "@/lib/socket/io";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import type {
  SocketConversationUpdatedPayload,
  SocketMessagePayload,
} from "@/lib/socket/events";

export function emitNewMessage(
  participantIds: string[],
  payload: SocketMessagePayload
) {
  const io = getSocketServer();
  if (!io) return;

  io.to(`conversation:${payload.conversationId}`).emit(
    SOCKET_EVENTS.MESSAGE_NEW,
    payload
  );

  for (const userId of participantIds) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, payload);
  }
}

export function emitConversationUpdated(
  payload: SocketConversationUpdatedPayload
) {
  const io = getSocketServer();
  if (!io) return;

  io.to(`conversation:${payload.conversationId}`).emit(
    SOCKET_EVENTS.CONVERSATION_UPDATED,
    payload
  );

  for (const userId of payload.participantIds) {
    io.to(`user:${userId}`).emit(
      SOCKET_EVENTS.CONVERSATION_UPDATED,
      payload
    );
  }
}
