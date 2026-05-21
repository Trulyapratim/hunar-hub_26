/**
 * POST /api/conversations/[id]/accept — receiver accepts a skill request.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptConversation } from "@/lib/messaging/conversation";
import { emitConversationUpdated } from "@/lib/socket/emit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const conv = await acceptConversation(id, session.user.id);
    emitConversationUpdated({
      conversationId: conv.id,
      status: conv.status,
      participantIds: conv.participantIds,
    });
    return NextResponse.json({ status: conv.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Accept failed" },
      { status: 400 }
    );
  }
}
