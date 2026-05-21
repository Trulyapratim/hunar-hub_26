/**
 * GET /api/conversations/[id] — full thread for the main chat panel.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConversationDetail } from "@/lib/messaging/conversation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await getConversationDetail(id, session.user.id);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}
