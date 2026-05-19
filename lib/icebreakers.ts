export const ICEBREAKERS = [
  "Quel est ton projet de rêve sur le campus ?",
  "Quel est ton événement campus préféré ?",
  "Quel est le plus gros problème de ton campus ?",
  "Startup ou corporate après les études ?",
  "Quelle compétence aimerais-tu apprendre cette année ?",
  "Quel sport pratiques-tu (ou aimerais-tu pratiquer) ?",
  "Quelle serait l'app étudiante idéale ?",
  "Quelle est la meilleure façon de rencontrer des gens sur ton campus ?",
  "Quelle association te fait envie ?",
  "Si tu avais 24h pour organiser un événement campus, ce serait quoi ?",
];

export function pickIcebreaker(round: number, pairKey: string): string {
  const index = (round * 7 + pairKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % ICEBREAKERS.length;
  return ICEBREAKERS[index];
}
