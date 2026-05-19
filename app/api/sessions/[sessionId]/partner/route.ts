import { NextResponse } from "next/server";
import { getPublicConfig } from "@/lib/config";
import { advanceRound, getPartnerForUser } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const profileId = new URL(req.url).searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 });
  }

  let data = getPartnerForUser(sessionId as SessionId, profileId);
  if (!data) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const { session, partner, sharedInterests, icebreaker, roundEndsAt } = data;

  if (
    session.status === "live" &&
    roundEndsAt &&
    Date.now() >= roundEndsAt
  ) {
    advanceRound(sessionId as SessionId);
    data = getPartnerForUser(sessionId as SessionId, profileId)!;
  }

  const s = data.session;
  const endsAt =
    s.roundStartedAt && s.status === "live"
      ? s.roundStartedAt + s.roundDurationSec * 1000
      : null;

  const { demoMode } = getPublicConfig();

  return NextResponse.json({
    demoMode,
    partner: data.partner,
    sharedInterests: data.sharedInterests,
    icebreaker: data.icebreaker,
    round: s.currentRound + 1,
    totalRounds: s.totalRounds,
    roundEndsAt: endsAt,
    roundDurationSec: s.roundDurationSec,
    status: s.status,
    checkedInCount: s.checkedInIds.length,
  });
}
