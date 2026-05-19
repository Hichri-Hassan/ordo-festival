export const INTERESTS = [
  "entrepreneurship",
  "AI",
  "coding",
  "sports",
  "music",
  "gaming",
  "photography",
  "startups",
  "associations",
  "design",
] as const;

export const LOOKING_FOR = [
  "meet people",
  "make friends",
  "find project teammates",
  "entrepreneurship",
  "discover associations",
  "networking",
] as const;

export const STUDY_YEARS = ["L1", "L2", "L3", "M1", "M2", "Doctorat", "Autre"] as const;

export const SESSIONS = [
  { id: "14-00", label: "14:00", hour: 14, minute: 0 },
  { id: "15-00", label: "15:00", hour: 15, minute: 0 },
  { id: "16-00", label: "16:00", hour: 16, minute: 0 },
  { id: "17-00", label: "17:00", hour: 17, minute: 0 },
] as const;

/** Session immédiate (mode test / démo uniquement) */
export const SESSION_NOW = { id: "now", label: "Maintenant" } as const;

export type SessionId = (typeof SESSIONS)[number]["id"] | typeof SESSION_NOW.id;

export type Profile = {
  id: string;
  firstName: string;
  studyYear: string;
  interests: string[];
  lookingFor: string[];
  createdAt: number;
};

export type SessionStatus = "waiting" | "live" | "ended";

export type SessionState = {
  sessionId: SessionId;
  participantIds: string[];
  checkedInIds: string[];
  status: SessionStatus;
  currentRound: number;
  totalRounds: number;
  roundDurationSec: number;
  roundStartedAt: number | null;
  pairings: Record<string, string>;
  icebreakers: Record<string, string>;
};

export type PartnerView = {
  partner: Pick<Profile, "firstName" | "studyYear" | "interests" | "lookingFor">;
  sharedInterests: string[];
  icebreaker: string;
  round: number;
  totalRounds: number;
  roundEndsAt: number | null;
  status: SessionStatus;
};
