/**
 * POST /api/conversations/[id]/messages — send a chat message (ACTIVE threads only).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendChatMessage } from "@/lib/messaging/conversation";
import { prisma } from "@/lib/prisma";
import { emitNewMessage } from "@/lib/socket/emit";

const bodySchema = z.object({
  content: z.string().min(1).max(4000),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  try {
    const message = await sendChatMessage(
      id,
      session.user.id,
      parsed.data.content
    );

    const conv = await prisma.conversation.findUnique({
      where: { id },
      select: { participantIds: true },
    });

    if (conv) {
      emitNewMessage(conv.participantIds, {
        conversationId: id,
        message,
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[messages]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed" },
      { status: 400 }
    );
  }
}
