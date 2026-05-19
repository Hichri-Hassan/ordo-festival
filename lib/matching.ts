import { pickIcebreaker } from "./icebreakers";
import type { Profile } from "./types";

const ROUNDS = 5;

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function interestScore(a: Profile, b: Profile): number {
  const shared = a.interests.filter((i) => b.interests.includes(i));
  return shared.length;
}

/** Pair participants for one round. Prioritize interest overlap when possible. */
export function computePairings(
  profiles: Profile[],
  round: number
): { pairings: Record<string, string>; icebreakers: Record<string, string> } {
  const pairings: Record<string, string> = {};
  const icebreakers: Record<string, string> = {};

  if (profiles.length < 2) return { pairings, icebreakers };

  const seed = round * 9973 + profiles.length;
  let pool = shuffle(profiles, seed);

  // Greedy pairing: sort by best interest match with next available
  const used = new Set<string>();

  while (pool.length >= 2) {
    const a = pool.shift()!;
    if (used.has(a.id)) continue;

    let bestIdx = 0;
    let bestScore = -1;
    for (let i = 0; i < pool.length; i++) {
      if (used.has(pool[i].id)) continue;
      const score = interestScore(a, pool[i]);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const b = pool.splice(bestIdx, 1)[0];
    pairings[a.id] = b.id;
    pairings[b.id] = a.id;
    used.add(a.id);
    used.add(b.id);

    const key = [a.id, b.id].sort().join(":");
    const question = pickIcebreaker(round, key);
    icebreakers[a.id] = question;
    icebreakers[b.id] = question;
  }

  return { pairings, icebreakers };
}

export function getSessionSchedule(sessionId: string): Date {
  const today = new Date();
  const [h, m] = sessionId.split("-").map(Number);
  const start = new Date(today);
  start.setHours(h, m, 0, 0);
  return start;
}

export { ROUNDS };
