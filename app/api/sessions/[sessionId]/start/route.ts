import { NextResponse } from "next/server";
import { forceStartSession } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { session, validCheckedIn, started } = forceStartSession(sessionId as SessionId);

  if (!started) {
    return NextResponse.json(
      {
        error: "NEED_TWO",
        message: "Il faut au moins 2 personnes check-in avec un profil valide.",
        validCheckedIn,
        session,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ session, validCheckedIn, started });
}
