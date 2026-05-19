/** Mode test : pas d'attente 14h–17h, tours de 15 s au lieu de 2 min */
export function isDemoMode(): boolean {
  return (
    process.env.ORDO_DEMO_MODE === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function getRoundDurationSec(): number {
  return isDemoMode() ? 15 : 120;
}

export function getTotalRounds(): number {
  return isDemoMode() ? 3 : 5;
}

/** En démo, le créneau = maintenant (countdown ~0) */
export function getSessionSchedule(sessionId: string): Date {
  if (isDemoMode()) {
    return new Date();
  }
  const today = new Date();
  const [h, m] = sessionId.split("-").map(Number);
  const start = new Date(today);
  start.setHours(h, m, 0, 0);
  return start;
}

export function getPublicConfig() {
  return {
    demoMode: isDemoMode(),
    roundDurationSec: getRoundDurationSec(),
    totalRounds: getTotalRounds(),
  };
}
