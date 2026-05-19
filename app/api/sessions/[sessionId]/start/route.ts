import { NextResponse } from "next/server";
import { forceStartSession } from "@/lib/store";
import type { SessionId } from "@/lib/types";

/** Host button at stand — starts session immediately */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = forceStartSession(sessionId as SessionId);
  return NextResponse.json(session);
}
