import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { saveProfile } from "@/lib/store";
import type { Profile } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { firstName, studyYear, interests, lookingFor } = body;

  if (!firstName?.trim() || !studyYear || !interests?.length || !lookingFor?.length) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const profile: Profile = {
    id: nanoid(12),
    firstName: firstName.trim(),
    studyYear,
    interests,
    lookingFor,
    createdAt: Date.now(),
  };

  saveProfile(profile);
  return NextResponse.json(profile);
}
