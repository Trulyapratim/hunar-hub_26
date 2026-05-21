import type { ConversationStatus } from "@prisma/client";

export type MessageDTO = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRequestMode: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
    image: string | null;
  };
};

export type ConversationPeer = {
  id: string;
  name: string | null;
  avatar: string | null;
  image: string | null;
  university: string | null;
};

export type ConversationListItem = {
  id: string;
  status: ConversationStatus;
  initiatedById: string | null;
  updatedAt: string;
  otherParticipant: ConversationPeer;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    isRequestMode: boolean;
  } | null;
  unreadRequest: boolean;
};

export type ConversationDetail = ConversationListItem & {
  messages: MessageDTO[];
  canSendMessages: boolean;
  isReceiverOfPendingRequest: boolean;
};
