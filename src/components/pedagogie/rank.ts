export const RANKS = [
  { name: "Fer", xp: 0 },
  { name: "Cuivre", xp: 50 },
  { name: "Bronze", xp: 150 },
  { name: "Argent", xp: 300 },
  { name: "Or", xp: 600 },
  { name: "Platine", xp: 1000 },
  { name: "Titane", xp: 1600 }
];

export function computeRank(totalXp: number) {
  let current = RANKS[0];
  let next = null;

  for (let i = 0; i < RANKS.length; i++) {
    if (totalXp >= RANKS[i].xp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }

  const progress = next
    ? (totalXp - current.xp) / (next.xp - current.xp)
    : 1;

  return {
    current,
    next,
    progress: Math.max(0, Math.min(progress, 1))
  };
}