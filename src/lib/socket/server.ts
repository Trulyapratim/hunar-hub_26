/**
 * Socket.io connection handlers — join user/conversation rooms for targeted emits.
 */
import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { prisma } from "@/lib/prisma";

type SocketAuth = {
  userId?: string;
};

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    const auth = socket.handshake.auth as SocketAuth;
    const userId = auth.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${userId}`);

    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, async (conversationId: string) => {
      if (!conversationId || typeof conversationId !== "string") return;

      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { participantIds: true },
      });

      if (conv?.participantIds.includes(userId)) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically
    });
  });
}
