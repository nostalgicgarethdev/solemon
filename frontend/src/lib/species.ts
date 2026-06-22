export const SPECIES = [
  { id: 0, name: "SOLizard", emoji: "🦎", color: "#9945FF", type: "SOL" },
  { id: 1, name: "RAYchu", emoji: "⚡", color: "#00D1FF", type: "RAY" },
  { id: 2, name: "BONKitten", emoji: "🐱", color: "#F5A623", type: "BONK" },
  { id: 3, name: "JUPiter", emoji: "🪐", color: "#6C5CE7", type: "JUP" },
  { id: 4, name: "WIFwolf", emoji: "🐺", color: "#E84393", type: "WIF" },
  { id: 5, name: "PENGUin", emoji: "🐧", color: "#74B9FF", type: "PENGU" },
] as const;

export const STARTERS = [0, 1, 4];

export function getSpecies(id: number) {
  return SPECIES[id] ?? SPECIES[0];
}