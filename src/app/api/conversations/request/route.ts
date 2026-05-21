/**
 * POST /api/conversations/request
 * Silently creates (or reuses) a conversation with an initial request message.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createSkillRequest } from "@/lib/messaging/conversation";
import { prisma } from "@/lib/prisma";
import { emitConversationUpdated, emitNewMessage } from "@/lib/socket/emit";
import { toMessageDTO } from "@/lib/messaging/conversation";

const bodySchema = z.object({
  peerId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "peerId is required" }, { status: 400 });
  }

  try {
    const { conversationId, created } = await createSkillRequest(
      session.user.id,
      parsed.data.peerId
    );

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
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

    if (conv && created && conv.messages[0]) {
      const messageDto = toMessageDTO(conv.messages[0]);
      emitNewMessage(conv.participantIds, {
        conversationId,
        message: messageDto,
      });
      emitConversationUpdated({
        conversationId,
        status: conv.status,
        participantIds: conv.participantIds,
      });
    }

    return NextResponse.json({ conversationId, created });
  } catch (error) {
    console.error("[conversations/request]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 }
    );
  }
}
