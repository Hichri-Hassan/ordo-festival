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

function trioScore(a: Profile, b: Profile, c: Profile): number {
  return interestScore(a, b) + interestScore(a, c) + interestScore(b, c);
}

/** Pick 3 participants with the most shared interests (for odd headcounts). */
function pickBestTrio(pool: Profile[]): Profile[] {
  if (pool.length <= 3) return pool;
  let best: Profile[] = pool.slice(0, 3);
  let bestScore = -1;
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let k = j + 1; k < pool.length; k++) {
        const trio = [pool[i], pool[j], pool[k]];
        const score = trioScore(trio[0], trio[1], trio[2]);
        if (score > bestScore) {
          bestScore = score;
          best = trio;
        }
      }
    }
  }
  return best;
}

function assignTrio(
  trio: Profile[],
  round: number,
  partnerIds: Record<string, string[]>,
  icebreakers: Record<string, string>
): void {
  const ids = trio.map((p) => p.id);
  const key = [...ids].sort().join(":");
  const question = pickIcebreaker(round, key);
  for (const p of trio) {
    partnerIds[p.id] = ids.filter((id) => id !== p.id);
    icebreakers[p.id] = question;
  }
}

/** Assign 1–2 partners per person. Odd counts use one trio; the rest are pairs. */
export function computePairings(
  profiles: Profile[],
  round: number
): { partnerIds: Record<string, string[]>; icebreakers: Record<string, string> } {
  const partnerIds: Record<string, string[]> = {};
  const icebreakers: Record<string, string> = {};

  if (profiles.length < 2) return { partnerIds, icebreakers };

  const seed = round * 9973 + profiles.length;
  let pool = shuffle(profiles, seed);

  if (pool.length % 2 === 1 && pool.length >= 3) {
    const trio = pickBestTrio(pool);
    assignTrio(trio, round, partnerIds, icebreakers);
    const trioSet = new Set(trio.map((p) => p.id));
    pool = pool.filter((p) => !trioSet.has(p.id));
  }

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
    partnerIds[a.id] = [b.id];
    partnerIds[b.id] = [a.id];
    used.add(a.id);
    used.add(b.id);

    const key = [a.id, b.id].sort().join(":");
    const question = pickIcebreaker(round, key);
    icebreakers[a.id] = question;
    icebreakers[b.id] = question;
  }

  return { partnerIds, icebreakers };
}

export { ROUNDS };
