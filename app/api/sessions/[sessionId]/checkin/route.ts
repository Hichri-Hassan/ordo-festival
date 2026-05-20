import { NextResponse } from "next/server";
import { checkIn } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { profileId, wave } = await req.json();

  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 });
  }
  if (!wave || typeof wave !== "string") {
    return NextResponse.json({ error: "WAVE_REQUIRED" }, { status: 400 });
  }

  try {
    const session = checkIn(sessionId as SessionId, profileId, wave.trim());
    return NextResponse.json(session);
  } catch (e) {
    if (e instanceof Error && e.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json(
        { error: "PROFILE_NOT_FOUND", profileMissing: true },
        { status: 404 }
      );
    }
    if (e instanceof Error && e.message === "WAVE_INVALID") {
      return NextResponse.json(
        { error: "WAVE_INVALID", message: "Ce lien n’est plus valide. Scanne le QR affiché au stand." },
        { status: 410 }
      );
    }
    if (e instanceof Error && e.message === "SESSION_IN_PROGRESS") {
      return NextResponse.json(
        { error: "SESSION_IN_PROGRESS", message: "La session est en cours. Reviens à la prochaine vague." },
        { status: 409 }
      );
    }
    throw e;
  }
}
