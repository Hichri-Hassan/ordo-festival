/** Mode test : pas d'attente 14h–17h ; mêmes tours de 2 min que le festival */
export function isDemoMode(): boolean {
  return (
    process.env.ORDO_DEMO_MODE === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function getRoundDurationSec(): number {
  return 120;
}

export function getTotalRounds(): number {
  return isDemoMode() ? 3 : 5;
}

/** Créneau immédiat ou horaire festival */
export function getSessionSchedule(sessionId: string): Date {
  if (sessionId === "now" || isDemoMode()) {
    return new Date();
  }
  const today = new Date();
  const [h, m] = sessionId.split("-").map(Number);
  const start = new Date(today);
  start.setHours(h, m, 0, 0);
  return start;
}

/** Infos pour vérifier que Railway sert le bon build (comparer au commit GitHub). */
export function getDeployHint(): { commitShort: string | null; buildLabel: string | null } {
  const sha =
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.RAILWAY_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;
  const commitShort =
    sha && typeof sha === "string" && sha.length >= 7 ? sha.slice(0, 7) : null;
  const label = process.env.ORDO_BUILD_LABEL;
  return {
    commitShort,
    buildLabel: label && String(label).trim() ? String(label).trim() : null,
  };
}

export function getPublicConfig() {
  return {
    demoMode: isDemoMode(),
    roundDurationSec: getRoundDurationSec(),
    totalRounds: getTotalRounds(),
    waveDurationMs: getWaveDurationMs(),
    ...getDeployHint(),
  };
}

/** Durée d'une vague (lien check-in valide). Défaut 5 min. */
export function getWaveDurationMs(): number {
  const mins = parseInt(process.env.ORDO_WAVE_MINUTES ?? "5", 10);
  return Math.max(1, Math.min(60, mins)) * 60 * 1000;
}
