/**
 * GET /api/conversations — sidebar list for the logged-in user.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listConversationsForUser } from "@/lib/messaging/conversation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await listConversationsForUser(session.user.id);
  return NextResponse.json({ conversations });
}
