import { NextResponse } from "next/server";
import { joinSession } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { profileId } = await req.json();

  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 });
  }

  const session = joinSession(sessionId as SessionId, profileId);
  return NextResponse.json(session);
}
