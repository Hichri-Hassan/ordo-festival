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

export function getOrCreateSession(sessionId: SessionId): SessionState {
  const existing = sessions.get(sessionId);
  if (existing) {
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
  const session = getOrCreateSession(sessionId);
  if (!session.participantIds.includes(profileId)) {
    session.participantIds.push(profileId);
  }
  return session;
}

export function checkIn(sessionId: SessionId, profileId: string): SessionState {
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

function getProfilesForSession(session: SessionState): Profile[] {
  return session.checkedInIds
    .map((id) => profiles.get(id))
    .filter((p): p is Profile => Boolean(p));
}

function startRound(session: SessionState, round: number): void {
  const participants = getProfilesForSession(session);
  const { pairings, icebreakers } = computePairings(participants, round);
  session.currentRound = round;
  session.pairings = pairings;
  session.icebreakers = icebreakers;
  session.roundStartedAt = Date.now();
  session.roundDurationSec = getRoundDurationSec();
  session.totalRounds = getTotalRounds();
}

export function maybeStartSession(session: SessionState): SessionState {
  if (session.status !== "waiting") return session;

  const checkedIn = session.checkedInIds.length >= 2;
  const timeReached =
    isDemoMode() || Date.now() >= getSessionSchedule(session.sessionId).getTime() - 60_000;

  if (checkedIn && timeReached) {
    session.status = "live";
    startRound(session, 0);
  }
  return session;
}

/** Force-start for demo / host at stand */
export function forceStartSession(sessionId: SessionId): SessionState {
  const session = getOrCreateSession(sessionId);
  if (session.status === "ended") return session;
  session.status = "live";
  startRound(session, 0);
  return session;
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

  startRound(session, next);
  return session;
}

export function getSessionPublic(sessionId: SessionId) {
  const session = getOrCreateSession(sessionId);
  maybeStartSession(session);
  const scheduled = getSessionSchedule(sessionId);
  return {
    ...session,
    ...getPublicConfig(),
    scheduledAt: scheduled.toISOString(),
    participantCount: session.participantIds.length,
    checkedInCount: session.checkedInIds.length,
  };
}

export function getPartnerForUser(sessionId: SessionId, userId: string) {
  const session = getOrCreateSession(sessionId);
  maybeStartSession(session);

  const partnerId = session.pairings[userId];
  const me = profiles.get(userId);
  const partner = partnerId ? profiles.get(partnerId) : undefined;

  if (!me) return null;

  const roundEndsAt =
    session.roundStartedAt && session.status === "live"
      ? session.roundStartedAt + session.roundDurationSec * 1000
      : null;

  const sharedInterests = partner
    ? me.interests.filter((i) => partner.interests.includes(i))
    : [];

  return {
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
  const { demoMode, roundDurationSec, totalRounds } = getPublicConfig();

  const scheduled = SESSIONS.map((s) =>
    sessionRow(s, profileId, demoMode, demoMode)
  );

  if (!demoMode) return scheduled;

  return [
    sessionRow(SESSION_NOW, profileId, true, true),
    ...scheduled,
  ];
}
