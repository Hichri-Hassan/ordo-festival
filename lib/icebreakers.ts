export const ICEBREAKERS = [
  "🎉 Pourquoi t'es au Pépite Festival ?",
  "🍔 Qu'est-ce qu'il manque au Pépite Festival à part un bon food truck ?",
  "🤝 Ton asso préférée du campus ?",
  "🚀 Un projet Pépite qui pourrait vraiment marcher",
  "💀 Le truc le plus relou à la fac à part les CM à 8h",
  "😂 Une anecdote récente",
  "🏫 Décris ton université sans dire son nom",
  "🌍 Ta ville/pays si c'était un animal ou un objet",
  "📱 Une app que tous les étudiants utiliseraient",
  "🔥 Un événement campus qui marcherait à coup sûr",
];

export function pickIcebreaker(round: number, pairKey: string): string {
  const index = (round * 7 + pairKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % ICEBREAKERS.length;
  return ICEBREAKERS[index];
}
