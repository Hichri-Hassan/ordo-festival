import { getPublicConfig, getRoundDurationSec, getSessionSchedule, getTotalRounds, isDemoMode } from "./config";
import { computePairings } from "./matching";
import type { Profile, SessionId, SessionState } from "./types";
import { SESSION_NOW, SESSIONS } from "./types";

const profiles = new Map<string, Profile>();
const sessions = new Map<SessionId, SessionState>();

function createSession(sessionId: SessionId): SessionState {
  const state: SessionState = {
    sessionId,
    participantIds: [],
    checkedInIds: [],
    status: "waiting",
    currentRound: 0,
    totalRounds: getTotalRounds(),
    roundDurationSec: getRoundDurationSec(),
    roundStartedAt: null,
    pairings: {},
    icebreakers: {},
  };
  sessions.set(sessionId, state);
  return state;
}

/** Retire les IDs dont le profil a disparu (redéploiement Railway, etc.) */
export function pruneStaleIds(session: SessionState): void {
  session.participantIds = session.participantIds.filter((id) => profiles.has(id));
  session.checkedInIds = session.checkedInIds.filter((id) => profiles.has(id));
}

export function getValidCheckedInProfiles(session: SessionState): Profile[] {
  pruneStaleIds(session);
  return session.checkedInIds
    .map((id) => profiles.get(id))
    .filter((p): p is Profile => Boolean(p));
}

export function getOrCreateSession(sessionId: SessionId): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) {
    pruneStaleIds(existing);
    existing.totalRounds = getTotalRounds();
    existing.roundDurationSec = getRoundDurationSec();
    return existing;
  }
  return createSession(sessionId);
}

export function saveProfile(profile: Profile): void {
  profiles.set(profile.id, profile);
}

export function getProfile(id: string): Profile | undefined {
  return profiles.get(id);
}

export function joinSession(sessionId: SessionId, profileId: string): SessionState {
  if (!profiles.has(profileId)) {
    throw new Error("PROFILE_NOT_FOUND");
  }
  const session = getOrCreateSession(sessionId);
  if (!session.participantIds.includes(profileId)) {
    session.participantIds.push(profileId);
  }
  return session;
}

export function checkIn(sessionId: SessionId, profileId: string): SessionState {
  if (!profiles.has(profileId)) {
    throw new Error("PROFILE_NOT_FOUND");
  }
  const session = getOrCreateSession(sessionId);
  if (!session.participantIds.includes(profileId)) {
    session.participantIds.push(profileId);
  }
  if (!session.checkedInIds.includes(profileId)) {
    session.checkedInIds.push(profileId);
  }
  maybeStartSession(session);
  return session;
}

function startRound(session: SessionState, round: number): boolean {
  const participants = getValidCheckedInProfiles(session);
  if (participants.length < 2) {
    session.pairings = {};
    session.icebreakers = {};
    session.roundStartedAt = null;
    if (session.status === "live") session.status = "waiting";
    return false;
  }

  const { pairings, icebreakers } = computePairings(participants, round);
  session.currentRound = round;
  session.pairings = pairings;
  session.icebreakers = icebreakers;
  session.roundStartedAt = Date.now();
  session.roundDurationSec = getRoundDurationSec();
  session.totalRounds = getTotalRounds();
  return true;
}

export function maybeStartSession(session: SessionState): SessionState {
  if (session.status !== "waiting") return session;

  const validCount = getValidCheckedInProfiles(session).length;
  const timeReached =
    isDemoMode() || Date.now() >= getSessionSchedule(session.sessionId).getTime() - 60_000;

  if (validCount >= 2 && timeReached) {
    session.status = "live";
    if (!startRound(session, 0)) session.status = "waiting";
  }
  return session;
}

/** Force-start for demo / host at stand */
export function forceStartSession(sessionId: SessionId): {
  session: SessionState;
  validCheckedIn: number;
  started: boolean;
} {
  const session = getOrCreateSession(sessionId);
  if (session.status === "ended") {
    return { session, validCheckedIn: getValidCheckedInProfiles(session).length, started: false };
  }

  const validCount = getValidCheckedInProfiles(session).length;
  if (validCount < 2) {
    session.status = "waiting";
    return { session, validCheckedIn: validCount, started: false };
  }

  session.status = "live";
  const started = startRound(session, 0);
  if (!started) session.status = "waiting";
  return { session, validCheckedIn: validCount, started };
}

export function advanceRound(sessionId: SessionId): SessionState {
  const session = getOrCreateSession(sessionId);
  if (session.status !== "live") return session;

  const next = session.currentRound + 1;
  if (next >= session.totalRounds) {
    session.status = "ended";
    session.roundStartedAt = null;
    return session;
  }

  if (!startRound(session, next)) {
    session.status = "waiting";
  }
  return session;
}

export function getSessionPublic(sessionId: SessionId) {
  const session = getOrCreateSession(sessionId);
  maybeStartSession(session);
  const scheduled = getSessionSchedule(sessionId);
  const validCheckedIn = getValidCheckedInProfiles(session).length;
  return {
    ...session,
    ...getPublicConfig(),
    scheduledAt: scheduled.toISOString(),
    participantCount: session.participantIds.length,
    checkedInCount: session.checkedInIds.length,
    validCheckedIn,
  };
}

export function getPartnerForUser(sessionId: SessionId, userId: string) {
  const session = getOrCreateSession(sessionId);
  maybeStartSession(session);

  const me = profiles.get(userId);
  if (!me) {
    return { profileMissing: true as const, session, me: null, partner: null, sharedInterests: [], icebreaker: "", roundEndsAt: null };
  }

  // Session live mais pas de binôme → recalculer (souvent après redéploiement)
  if (session.status === "live" && !session.pairings[userId]) {
    const validCount = getValidCheckedInProfiles(session).length;
    if (validCount >= 2) {
      startRound(session, session.currentRound);
    } else {
      session.status = "waiting";
    }
  }

  const partnerId = session.pairings[userId];
  const partner = partnerId ? profiles.get(partnerId) : undefined;

  const roundEndsAt =
    session.roundStartedAt && session.status === "live"
      ? session.roundStartedAt + session.roundDurationSec * 1000
      : null;

  const sharedInterests = partner
    ? me.interests.filter((i) => partner.interests.includes(i))
    : [];

  return {
    profileMissing: false as const,
    session,
    me,
    partner: partner
      ? {
          firstName: partner.firstName,
          studyYear: partner.studyYear,
          interests: partner.interests,
          lookingFor: partner.lookingFor,
        }
      : null,
    sharedInterests,
    icebreaker: session.icebreakers[userId] ?? "",
    roundEndsAt,
    validCheckedIn: getValidCheckedInProfiles(session).length,
  };
}

function sessionRow(
  s: { id: SessionId; label: string },
  profileId: string,
  demoMode: boolean,
  startsNow: boolean
) {
  const session = getOrCreateSession(s.id);
  const joined = session.participantIds.includes(profileId);
  return {
    ...s,
    joined,
    startsNow,
    participantCount: session.participantIds.length,
    status: session.status,
    scheduledAt: getSessionSchedule(s.id).toISOString(),
    demoMode,
  };
}

export function listSessionsForUser(profileId: string) {
  const { demoMode } = getPublicConfig();

  const scheduled = SESSIONS.map((s) =>
    sessionRow(s, profileId, demoMode, demoMode)
  );

  if (!demoMode) return scheduled;

  return [sessionRow(SESSION_NOW, profileId, true, true), ...scheduled];
}
