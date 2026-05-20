import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config";
import { resetSessionState } from "@/lib/store";
import type { SessionId } from "@/lib/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Disponible en mode test uniquement" }, { status: 403 });
  }

  const { sessionId } = await params;
  const session = resetSessionState(sessionId as SessionId);
  return NextResponse.json(session);
}
