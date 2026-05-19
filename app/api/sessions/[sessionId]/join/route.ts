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

  try {
    const session = joinSession(sessionId as SessionId, profileId);
    return NextResponse.json(session);
  } catch (e) {
    if (e instanceof Error && e.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json(
        { error: "PROFILE_NOT_FOUND", profileMissing: true },
        { status: 404 }
      );
    }
    throw e;
  }
}
