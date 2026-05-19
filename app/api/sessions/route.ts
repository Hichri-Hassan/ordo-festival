import { NextResponse } from "next/server";
import { listSessionsForUser } from "@/lib/store";

export async function GET(req: Request) {
  const profileId = new URL(req.url).searchParams.get("profileId");
  if (!profileId) {
    return NextResponse.json({ error: "profileId requis" }, { status: 400 });
  }
  return NextResponse.json({ sessions: listSessionsForUser(profileId) });
}
