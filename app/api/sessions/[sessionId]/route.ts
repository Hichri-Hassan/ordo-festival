import { NextResponse } from "next/server";
import { getSessionPublic } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json(getSessionPublic(sessionId as SessionId));
}
