/**
 * Conversation & message persistence layer.
 * Handles skill-request creation, accept/decline, and chat history.
 */
import { ConversationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { INITIAL_REQUEST_MESSAGE } from "@/lib/messaging/constants";
import type {
  ConversationDetail,
  ConversationListItem,
  ConversationPeer,
  MessageDTO,
} from "@/lib/messaging/types";

/** Canonical two-user participant key (sorted) for deduplication. */
export function sortedParticipantIds(a: string, b: string): string[] {
  return [a, b].sort();
}

function toPeer(user: {
  id: string;
  name: string | null;
  avatar: string | null;
  image: string | null;
  university: string | null;
}): ConversationPeer {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    image: user.image,
    university: user.university,
  };
}

function toMessageDTO(
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRequestMode: boolean;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      avatar: string | null;
      image: string | null;
    };
  }
): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    isRequestMode: message.isRequestMode,
    createdAt: message.createdAt.toISOString(),
    sender: message.sender,
  };
}

export async function findConversationBetween(
  userIdA: string,
  userIdB: string
) {
  const participantIds = sortedParticipantIds(userIdA, userIdB);
  return prisma.conversation.findFirst({
    where: { participantIds: { equals: participantIds } },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              image: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Creates (or reopens) a PENDING conversation and inserts the request message.
 * Silent from the UI — caller navigates to /messages.
 */
export async function createSkillRequest(
  fromUserId: string,
  toUserId: string
): Promise<{ conversationId: string; created: boolean }> {
  if (fromUserId === toUserId) {
    throw new Error("Cannot message yourself");
  }

  const participantIds = sortedParticipantIds(fromUserId, toUserId);
  const existing = await prisma.conversation.findFirst({
    where: { participantIds: { equals: participantIds } },
  });

  if (existing) {
    if (existing.status === ConversationStatus.ACTIVE) {
      return { conversationId: existing.id, created: false };
    }

    if (existing.status === ConversationStatus.PENDING) {
      return { conversationId: existing.id, created: false };
    }

    // DECLINED — allow a fresh request
    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { conversationId: existing.id } });
      await tx.conversation.update({
        where: { id: existing.id },
        data: {
          status: ConversationStatus.PENDING,
          initiatedById: fromUserId,
        },
      });
      await tx.message.create({
        data: {
          conversationId: existing.id,
          senderId: fromUserId,
          content: INITIAL_REQUEST_MESSAGE,
          isRequestMode: true,
        },
      });
    });

    return { conversationId: existing.id, created: true };
  }

  const conversation = await prisma.conversation.create({
    data: {
      participantIds,
      status: ConversationStatus.PENDING,
      initiatedById: fromUserId,
      messages: {
        create: {
          senderId: fromUserId,
          content: INITIAL_REQUEST_MESSAGE,
          isRequestMode: true,
        },
      },
    },
    include: {
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return { conversationId: conversation.id, created: true };
}

export async function listConversationsForUser(
  userId: string
): Promise<ConversationListItem[]> {
  const conversations = await prisma.conversation.findMany({
    where: { participantIds: { has: userId } },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { id: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const otherIds = conversations
    .map((c) => c.participantIds.find((id) => id !== userId))
    .filter((id): id is string => Boolean(id));

  const peers = await prisma.user.findMany({
    where: { id: { in: otherIds } },
    select: {
      id: true,
      name: true,
      avatar: true,
      image: true,
      university: true,
    },
  });

  const peerMap = new Map(peers.map((p) => [p.id, p]));

  return conversations.map((conv) => {
    const otherId = conv.participantIds.find((id) => id !== userId)!;
    const otherUser = peerMap.get(otherId);
    const last = conv.messages[0];

    const unreadRequest =
      conv.status === ConversationStatus.PENDING &&
      conv.initiatedById !== userId;

    return {
      id: conv.id,
      status: conv.status,
      initiatedById: conv.initiatedById,
      updatedAt: conv.updatedAt.toISOString(),
      otherParticipant: otherUser
        ? toPeer(otherUser)
        : {
            id: otherId,
            name: "Unknown",
            avatar: null,
            image: null,
            university: null,
          },
      lastMessage: last
        ? {
            content: last.content,
            createdAt: last.createdAt.toISOString(),
            senderId: last.senderId,
            isRequestMode: last.isRequestMode,
          }
        : null,
      unreadRequest,
    };
  });
}

export async function getConversationDetail(
  conversationId: string,
  userId: string
): Promise<ConversationDetail | null> {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!conv || !conv.participantIds.includes(userId)) {
    return null;
  }

  const otherId = conv.participantIds.find((id) => id !== userId)!;
  const otherUser = await prisma.user.findUnique({
    where: { id: otherId },
    select: {
      id: true,
      name: true,
      avatar: true,
      image: true,
      university: true,
    },
  });

  const isReceiverOfPendingRequest =
    conv.status === ConversationStatus.PENDING &&
    conv.initiatedById !== userId;

  const canSendMessages = conv.status === ConversationStatus.ACTIVE;

  const listItem: ConversationListItem = {
    id: conv.id,
    status: conv.status,
    initiatedById: conv.initiatedById,
    updatedAt: conv.updatedAt.toISOString(),
    otherParticipant: otherUser
      ? toPeer(otherUser)
      : {
          id: otherId,
          name: "Unknown",
          avatar: null,
          image: null,
          university: null,
        },
    lastMessage: conv.messages.length
      ? {
          content: conv.messages[conv.messages.length - 1].content,
          createdAt:
            conv.messages[conv.messages.length - 1].createdAt.toISOString(),
          senderId: conv.messages[conv.messages.length - 1].senderId,
          isRequestMode:
            conv.messages[conv.messages.length - 1].isRequestMode,
        }
      : null,
    unreadRequest: isReceiverOfPendingRequest,
  };

  return {
    ...listItem,
    messages: conv.messages.map(toMessageDTO),
    canSendMessages,
    isReceiverOfPendingRequest,
  };
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conv || !conv.participantIds.includes(senderId)) {
    throw new Error("Conversation not found");
  }

  if (conv.status !== ConversationStatus.ACTIVE) {
    throw new Error("Conversation is not active");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId,
        senderId,
        content: trimmed,
        isRequestMode: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            image: true,
          },
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return created;
  });

  return toMessageDTO(message);
}

export async function acceptConversation(
  conversationId: string,
  userId: string
) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conv || !conv.participantIds.includes(userId)) {
    throw new Error("Conversation not found");
  }

  if (conv.status !== ConversationStatus.PENDING) {
    throw new Error("Request is no longer pending");
  }

  if (conv.initiatedById === userId) {
    throw new Error("Cannot accept your own request");
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.ACTIVE },
  });
}

export async function declineConversation(
  conversationId: string,
  userId: string
) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conv || !conv.participantIds.includes(userId)) {
    throw new Error("Conversation not found");
  }

  if (conv.status !== ConversationStatus.PENDING) {
    throw new Error("Request is no longer pending");
  }

  if (conv.initiatedById === userId) {
    throw new Error("Cannot decline your own request");
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.DECLINED },
  });
}

export { toMessageDTO };
