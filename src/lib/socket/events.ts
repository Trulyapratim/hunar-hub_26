/** Socket.io event names — shared between server and client. */
export const SOCKET_EVENTS = {
  JOIN_USER: "join:user",
  JOIN_CONVERSATION: "join:conversation",
  MESSAGE_NEW: "message:new",
  CONVERSATION_UPDATED: "conversation:updated",
} as const;

export type SocketMessagePayload = {
  conversationId: string;
  message: import("@/lib/messaging/types").MessageDTO;
};

export type SocketConversationUpdatedPayload = {
  conversationId: string;
  status: import("@prisma/client").ConversationStatus;
  participantIds: string[];
};
