export interface Enemy {
  name: string;
  emoji: string;
  minLevel: number;
  maxLevel: number;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  coinReward: number;
  dropRate: number;
}

export const ENEMIES: Enemy[] = [
  // ── Tier 1 (levels 1-4) ──
  { name: "Rat Swarm",    emoji: "🐀",  minLevel: 1,  maxLevel: 2,  hp: 10,   attack: 3,   defense: 0,   xpReward: 6,   coinReward: 3,   dropRate: 0.25 },
  { name: "Slime",        emoji: "🟢",  minLevel: 1,  maxLevel: 3,  hp: 15,   attack: 4,   defense: 1,   xpReward: 10,  coinReward: 5,   dropRate: 0.3 },
  { name: "Imp",          emoji: "👿",  minLevel: 1,  maxLevel: 4,  hp: 20,   attack: 6,   defense: 1,   xpReward: 15,  coinReward: 7,   dropRate: 0.32 },
  { name: "Living Mushroom", emoji: "🍄", minLevel: 1, maxLevel: 3,  hp: 12,   attack: 4,   defense: 1,   xpReward: 8,   coinReward: 4,   dropRate: 0.28 },

  // ── Tier 2 (levels 2-6) ──
  { name: "Bandit",       emoji: "🗡️",  minLevel: 2,  maxLevel: 5,  hp: 22,   attack: 7,   defense: 2,   xpReward: 17,  coinReward: 8,   dropRate: 0.33 },
  { name: "Goblin",       emoji: "👺",  minLevel: 2,  maxLevel: 5,  hp: 25,   attack: 7,   defense: 2,   xpReward: 20,  coinReward: 10,  dropRate: 0.35 },
  { name: "Fire Slime",   emoji: "🔴",  minLevel: 3,  maxLevel: 6,  hp: 28,   attack: 9,   defense: 2,   xpReward: 25,  coinReward: 12,  dropRate: 0.36 },
  { name: "Cave Bat",     emoji: "🦇",  minLevel: 2,  maxLevel: 5,  hp: 18,   attack: 8,   defense: 1,   xpReward: 14,  coinReward: 6,   dropRate: 0.3 },

  // ── Tier 3 (levels 4-8) ──
  { name: "Spider",       emoji: "🕷️",  minLevel: 4,  maxLevel: 7,  hp: 30,   attack: 10,  defense: 3,   xpReward: 30,  coinReward: 15,  dropRate: 0.38 },
  { name: "Wolf",         emoji: "🐺",  minLevel: 4,  maxLevel: 7,  hp: 35,   attack: 10,  defense: 3,   xpReward: 35,  coinReward: 18,  dropRate: 0.4 },
  { name: "Ghost",        emoji: "👻",  minLevel: 5,  maxLevel: 8,  hp: 32,   attack: 12,  defense: 2,   xpReward: 38,  coinReward: 20,  dropRate: 0.41 },
  { name: "Mimic",        emoji: "📦",  minLevel: 4,  maxLevel: 9,  hp: 40,   attack: 14,  defense: 5,   xpReward: 50,  coinReward: 25,  dropRate: 0.6 },

  // ── Tier 4 (levels 5-9) ──
  { name: "Harpy",        emoji: "🦅",  minLevel: 5,  maxLevel: 8,  hp: 40,   attack: 12,  defense: 4,   xpReward: 45,  coinReward: 22,  dropRate: 0.42 },
  { name: "Zombie",       emoji: "🧟",  minLevel: 6,  maxLevel: 9,  hp: 45,   attack: 11,  defense: 5,   xpReward: 48,  coinReward: 23,  dropRate: 0.43 },
  { name: "Skeleton",     emoji: "💀",  minLevel: 6,  maxLevel: 10, hp: 50,   attack: 13,  defense: 5,   xpReward: 55,  coinReward: 25,  dropRate: 0.45 },
  { name: "Sand Worm",    emoji: "🪱",  minLevel: 5,  maxLevel: 9,  hp: 55,   attack: 10,  defense: 6,   xpReward: 40,  coinReward: 20,  dropRate: 0.4 },

  // ── Tier 5 (levels 7-12) ──
  { name: "Shadow Beast", emoji: "👤",  minLevel: 7,  maxLevel: 11, hp: 55,   attack: 15,  defense: 6,   xpReward: 65,  coinReward: 30,  dropRate: 0.47 },
  { name: "Golem",        emoji: "🗿",  minLevel: 8,  maxLevel: 12, hp: 80,   attack: 11,  defense: 12,  xpReward: 70,  coinReward: 32,  dropRate: 0.48 },
  { name: "Ice Slime",    emoji: "🔵",  minLevel: 8,  maxLevel: 12, hp: 60,   attack: 14,  defense: 8,   xpReward: 68,  coinReward: 31,  dropRate: 0.46 },
  { name: "Orc",          emoji: "💚",  minLevel: 7,  maxLevel: 11, hp: 65,   attack: 16,  defense: 7,   xpReward: 60,  coinReward: 28,  dropRate: 0.45 },

  // ── Tier 6 (levels 9-14) ──
  { name: "Dark Mage",    emoji: "🧙",  minLevel: 9,  maxLevel: 13, hp: 70,   attack: 17,  defense: 7,   xpReward: 80,  coinReward: 35,  dropRate: 0.5 },
  { name: "Vampire",      emoji: "🧛",  minLevel: 9,  maxLevel: 13, hp: 65,   attack: 18,  defense: 6,   xpReward: 85,  coinReward: 38,  dropRate: 0.51 },
  { name: "Lich",         emoji: "☠️",  minLevel: 10, maxLevel: 14, hp: 65,   attack: 20,  defense: 6,   xpReward: 90,  coinReward: 40,  dropRate: 0.52 },
  { name: "Wraith",       emoji: "🌫️",  minLevel: 9,  maxLevel: 14, hp: 55,   attack: 22,  defense: 4,   xpReward: 75,  coinReward: 33,  dropRate: 0.5 },

  // ── Tier 7 (levels 11-16) ──
  { name: "Werewolf",     emoji: "🐺",  minLevel: 11, maxLevel: 15, hp: 80,   attack: 19,  defense: 9,   xpReward: 95,  coinReward: 42,  dropRate: 0.53 },
  { name: "Wyvern",       emoji: "🐲",  minLevel: 11, maxLevel: 15, hp: 85,   attack: 18,  defense: 8,   xpReward: 100, coinReward: 45,  dropRate: 0.53 },
  { name: "Chimera",      emoji: "🦁",  minLevel: 12, maxLevel: 16, hp: 95,   attack: 21,  defense: 10,  xpReward: 110, coinReward: 48,  dropRate: 0.54 },
  { name: "Naga",         emoji: "🐍",  minLevel: 11, maxLevel: 15, hp: 75,   attack: 22,  defense: 8,   xpReward: 105, coinReward: 44,  dropRate: 0.52 },

  // ── Tier 8 (levels 12-20) ──
  { name: "Dragon",       emoji: "🐉",  minLevel: 12, maxLevel: 20, hp: 100,  attack: 22,  defense: 10,  xpReward: 120, coinReward: 50,  dropRate: 0.55 },
  { name: "Beholder",     emoji: "👁️",  minLevel: 13, maxLevel: 18, hp: 90,   attack: 24,  defense: 9,   xpReward: 130, coinReward: 55,  dropRate: 0.57 },
  { name: "Manticore",    emoji: "🦂",  minLevel: 13, maxLevel: 18, hp: 105,  attack: 23,  defense: 11,  xpReward: 135, coinReward: 58,  dropRate: 0.56 },
  { name: "Gorgon",       emoji: "🐍",  minLevel: 12, maxLevel: 19, hp: 95,   attack: 25,  defense: 12,  xpReward: 125, coinReward: 52,  dropRate: 0.55 },

  // ── Tier 9 (levels 14-22) ──
  { name: "Hydra",        emoji: "🐍",  minLevel: 14, maxLevel: 20, hp: 130,  attack: 20,  defense: 11,  xpReward: 140, coinReward: 60,  dropRate: 0.58 },
  { name: "Cerberus",     emoji: "🐕",  minLevel: 14, maxLevel: 20, hp: 120,  attack: 24,  defense: 12,  xpReward: 145, coinReward: 62,  dropRate: 0.59 },
  { name: "Phoenix",      emoji: "🔥",  minLevel: 15, maxLevel: 25, hp: 110,  attack: 26,  defense: 12,  xpReward: 160, coinReward: 70,  dropRate: 0.6 },
  { name: "Minotaur",     emoji: "🐃",  minLevel: 14, maxLevel: 22, hp: 140,  attack: 22,  defense: 14,  xpReward: 150, coinReward: 65,  dropRate: 0.58 },

  // ── Tier 10 (levels 16-28) ──
  { name: "Kraken",       emoji: "🐙",  minLevel: 16, maxLevel: 25, hp: 140,  attack: 24,  defense: 13,  xpReward: 175, coinReward: 75,  dropRate: 0.62 },
  { name: "Leviathan",    emoji: "🐳",  minLevel: 17, maxLevel: 28, hp: 160,  attack: 26,  defense: 15,  xpReward: 185, coinReward: 80,  dropRate: 0.63 },
  { name: "Titan",        emoji: "🏔️",  minLevel: 18, maxLevel: 28, hp: 180,  attack: 28,  defense: 18,  xpReward: 200, coinReward: 85,  dropRate: 0.65 },
  { name: "Thunder Bird", emoji: "🦅",  minLevel: 16, maxLevel: 26, hp: 130,  attack: 27,  defense: 12,  xpReward: 170, coinReward: 72,  dropRate: 0.62 },

  // ── Tier 11 (levels 20-35) ──
  { name: "Angel",        emoji: "👼",  minLevel: 20, maxLevel: 30, hp: 160,  attack: 30,  defense: 16,  xpReward: 210, coinReward: 90,  dropRate: 0.66 },
  { name: "Archdemon",    emoji: "😈",  minLevel: 20, maxLevel: 32, hp: 200,  attack: 32,  defense: 18,  xpReward: 230, coinReward: 95,  dropRate: 0.68 },
  { name: "Demon Lord",   emoji: "👹",  minLevel: 20, maxLevel: 35, hp: 220,  attack: 35,  defense: 20,  xpReward: 250, coinReward: 100, dropRate: 0.7 },
  { name: "Fallen Angel", emoji: "🕊️",  minLevel: 20, maxLevel: 33, hp: 180,  attack: 33,  defense: 17,  xpReward: 220, coinReward: 92,  dropRate: 0.67 },

  // ── Tier 12 (levels 25-50) ──
  { name: "Void Walker",  emoji: "🌑",  minLevel: 25, maxLevel: 40, hp: 260,  attack: 38,  defense: 22,  xpReward: 280, coinReward: 110, dropRate: 0.72 },
  { name: "Elder Dragon", emoji: "🐲",  minLevel: 28, maxLevel: 45, hp: 300,  attack: 40,  defense: 25,  xpReward: 320, coinReward: 120, dropRate: 0.75 },
  { name: "Cosmic Entity",emoji: "🌌",  minLevel: 30, maxLevel: 50, hp: 350,  attack: 45,  defense: 28,  xpReward: 380, coinReward: 140, dropRate: 0.78 },
  { name: "Time Weaver",  emoji: "⏳",  minLevel: 25, maxLevel: 42, hp: 240,  attack: 36,  defense: 20,  xpReward: 260, coinReward: 105, dropRate: 0.7 },

  // ── Tier 13 (levels 30-60) ──
  { name: "Astral Beast", emoji: "🌟",  minLevel: 30, maxLevel: 50, hp: 400,  attack: 48,  defense: 30,  xpReward: 450, coinReward: 160, dropRate: 0.8 },
  { name: "Void Lord",    emoji: "🕳️",  minLevel: 32, maxLevel: 55, hp: 450,  attack: 50,  defense: 32,  xpReward: 500, coinReward: 180, dropRate: 0.82 },
  { name: "Storm Giant",  emoji: "⛈️",  minLevel: 30, maxLevel: 52, hp: 420,  attack: 52,  defense: 28,  xpReward: 480, coinReward: 170, dropRate: 0.8 },
  { name: "Celestial Drake", emoji: "☀️", minLevel: 35, maxLevel: 60, hp: 500, attack: 55, defense: 35, xpReward: 550, coinReward: 200, dropRate: 0.85 },

  // ── Tier 14 (levels 40-75) ──
  { name: "World Serpent", emoji: "🌍", minLevel: 40, maxLevel: 65, hp: 600, attack: 58, defense: 38, xpReward: 650, coinReward: 230, dropRate: 0.85 },
  { name: "Fate Spinner",  emoji: "🧵", minLevel: 42, maxLevel: 70, hp: 550, attack: 62, defense: 36, xpReward: 700, coinReward: 250, dropRate: 0.87 },
  { name: "Reaper",        emoji: "💀", minLevel: 45, maxLevel: 75, hp: 650, attack: 65, defense: 40, xpReward: 800, coinReward: 280, dropRate: 0.88 },
  { name: "Nightmare",     emoji: "🌑", minLevel: 40, maxLevel: 68, hp: 580, attack: 60, defense: 35, xpReward: 680, coinReward: 240, dropRate: 0.85 },

  // ── Tier 15 (levels 50-100) ──
  { name: "Apocalypse",   emoji: "☠️", minLevel: 50, maxLevel: 85, hp: 800, attack: 72, defense: 45, xpReward: 1000, coinReward: 350, dropRate: 0.9 },
  { name: "Creator",      emoji: "✨", minLevel: 55, maxLevel: 90, hp: 900, attack: 78, defense: 50, xpReward: 1200, coinReward: 400, dropRate: 0.92 },
  { name: "Omega",        emoji: "♾️", minLevel: 60, maxLevel: 100, hp: 1000, attack: 85, defense: 55, xpReward: 1500, coinReward: 500, dropRate: 0.95 },
  { name: "The One",      emoji: "🌀", minLevel: 70, maxLevel: 100, hp: 1200, attack: 95, defense: 60, xpReward: 2000, coinReward: 600, dropRate: 0.96 },

  // ── Tier 15+ (levels 55-100) ──
  { name: "Eternal Phoenix",   emoji: "🔥", minLevel: 55, maxLevel: 90,  hp: 850,  attack: 75,  defense: 48,  xpReward: 1100, coinReward: 380, dropRate: 0.91 },
  { name: "Dimension Walker", emoji: "🌀", minLevel: 60, maxLevel: 95,  hp: 950,  attack: 82,  defense: 52,  xpReward: 1300, coinReward: 420, dropRate: 0.92 },

  // ── Tier 16 (levels 80-150) ──
  { name: "Transcendence",   emoji: "✨", minLevel: 80,  maxLevel: 120, hp: 1500, attack: 100, defense: 65,  xpReward: 2500, coinReward: 800,  dropRate: 0.93 },
  { name: "Nova Beast",      emoji: "💫", minLevel: 85,  maxLevel: 130, hp: 1800, attack: 110, defense: 70,  xpReward: 3000, coinReward: 1000, dropRate: 0.94 },
  { name: "Eternal One",     emoji: "♾️", minLevel: 90,  maxLevel: 140, hp: 2000, attack: 120, defense: 75,  xpReward: 3500, coinReward: 1200, dropRate: 0.95 },
  { name: "Paradox",         emoji: "🔄", minLevel: 95,  maxLevel: 150, hp: 2500, attack: 130, defense: 80,  xpReward: 4000, coinReward: 1500, dropRate: 0.96 },

  // ── Tier 17 (levels 120-200) ──
  { name: "Infinity Worm",   emoji: "∞",  minLevel: 120, maxLevel: 170, hp: 3000, attack: 145, defense: 90,  xpReward: 5000, coinReward: 1800, dropRate: 0.96 },
  { name: "Absolute Being",  emoji: "☀️", minLevel: 130, maxLevel: 180, hp: 3500, attack: 155, defense: 95,  xpReward: 6000, coinReward: 2200, dropRate: 0.97 },
  { name: "Cosmic Overlord", emoji: "🌠", minLevel: 140, maxLevel: 190, hp: 4000, attack: 170, defense: 100, xpReward: 8000, coinReward: 2800, dropRate: 0.97 },
  { name: "The Endless",     emoji: "🕳️", minLevel: 150, maxLevel: 200, hp: 5000, attack: 200, defense: 120, xpReward: 10000, coinReward: 3500, dropRate: 0.98 },

  // ── Tier 3 extra (levels 3-8) ──
  { name: "Fire Elemental", emoji: "🔥", minLevel: 3,  maxLevel: 7,  hp: 35,  attack: 11, defense: 3,  xpReward: 28,  coinReward: 13, dropRate: 0.37 },
  { name: "Dark Imp",       emoji: "👾", minLevel: 3,  maxLevel: 7,  hp: 28,  attack: 10, defense: 2,  xpReward: 24,  coinReward: 11, dropRate: 0.34 },

  // ── Tier 5 extra (levels 7-12) ──
  { name: "Treant",   emoji: "🌳", minLevel: 7,  maxLevel: 12, hp: 70,  attack: 13, defense: 10, xpReward: 62, coinReward: 29, dropRate: 0.46 },
  { name: "Dark Elf", emoji: "🧝", minLevel: 8,  maxLevel: 12, hp: 58,  attack: 17, defense: 7,  xpReward: 64, coinReward: 30, dropRate: 0.45 },

  // ── Tier 7 extra (levels 11-16) ──
  { name: "Basilisk", emoji: "🐍", minLevel: 11, maxLevel: 16, hp: 88,  attack: 20, defense: 9,  xpReward: 98, coinReward: 43, dropRate: 0.52 },
  { name: "Griffon",  emoji: "🦅", minLevel: 12, maxLevel: 16, hp: 90,  attack: 21, defense: 10, xpReward: 102, coinReward: 46, dropRate: 0.53 },

  // ── Tier 9 extra (levels 14-22) ──
  { name: "Seraph",  emoji: "👼", minLevel: 14, maxLevel: 22, hp: 125, attack: 23, defense: 12, xpReward: 148, coinReward: 63, dropRate: 0.59 },
  { name: "Banshee", emoji: "👻", minLevel: 15, maxLevel: 22, hp: 100, attack: 28, defense: 8,  xpReward: 155, coinReward: 66, dropRate: 0.58 },

  // ── Tier 11 extra (levels 20-35) ──
  { name: "Abyssal Lord", emoji: "🌊", minLevel: 20, maxLevel: 34, hp: 210, attack: 34, defense: 19, xpReward: 240, coinReward: 98, dropRate: 0.68 },
  { name: "Dark Titan",   emoji: "🗻", minLevel: 22, maxLevel: 35, hp: 240, attack: 31, defense: 21, xpReward: 245, coinReward: 99, dropRate: 0.67 },

  // ── Tier 13 extra (levels 30-60) ──
  { name: "Eternal Guardian", emoji: "🗿", minLevel: 33, maxLevel: 58, hp: 480, attack: 53, defense: 34, xpReward: 490, coinReward: 175, dropRate: 0.82 },
  { name: "Nebula Wraith",    emoji: "🌫️", minLevel: 35, maxLevel: 60, hp: 460, attack: 56, defense: 31, xpReward: 520, coinReward: 185, dropRate: 0.83 },
];

export const BOSSES: Enemy[] = [
  { name: "Fallen King",     emoji: "👑", minLevel: 5,  maxLevel: 20, hp: 200,  attack: 25,  defense: 15, xpReward: 500,  coinReward: 200, dropRate: 1 },
  { name: "Nightmare Lord",  emoji: "🌑", minLevel: 10, maxLevel: 30, hp: 350,  attack: 35,  defense: 20, xpReward: 1000, coinReward: 400, dropRate: 1 },
  { name: "Eternal Wyrm",    emoji: "🐉", minLevel: 15, maxLevel: 40, hp: 500,  attack: 45,  defense: 28, xpReward: 2000, coinReward: 700, dropRate: 1 },
  { name: "Doom Bringer",    emoji: "💀", minLevel: 20, maxLevel: 50, hp: 700,  attack: 55,  defense: 35, xpReward: 3500, coinReward: 1000, dropRate: 1 },
  { name: "Oblivion",        emoji: "🕳️", minLevel: 25, maxLevel: 60, hp: 1000, attack: 65,  defense: 42, xpReward: 5500, coinReward: 1500, dropRate: 1 },
  { name: "God of War",      emoji: "⚔️", minLevel: 30, maxLevel: 70, hp: 1400, attack: 80,  defense: 50, xpReward: 8000, coinReward: 2000, dropRate: 1 },
  { name: "Cosmic Horror",   emoji: "🌌", minLevel: 40, maxLevel: 85, hp: 2000, attack: 95,  defense: 60, xpReward: 12000, coinReward: 3000, dropRate: 1 },
  { name: "The Beyond",      emoji: "🌀", minLevel: 50, maxLevel: 100, hp: 3000, attack: 120, defense: 75, xpReward: 20000, coinReward: 5000, dropRate: 1 },

  // ── Ultra Bosses (level 80+) ──
  { name: "World Eater",      emoji: "🌍", minLevel: 80,  maxLevel: 150, hp: 5000,  attack: 150, defense: 90,  xpReward: 40000,  coinReward: 10000, dropRate: 1 },
  { name: "Aetherius",        emoji: "☀️", minLevel: 100, maxLevel: 180, hp: 8000,  attack: 180, defense: 110, xpReward: 60000,  coinReward: 15000, dropRate: 1 },
  { name: "The Great Old One", emoji: "🐙", minLevel: 120, maxLevel: 200, hp: 12000, attack: 220, defense: 140, xpReward: 100000, coinReward: 25000, dropRate: 1 },
];

export function getBossForLevel(level: number): Enemy | null {
  const eligible = BOSSES.filter((b) => level >= b.minLevel && level <= b.maxLevel);
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** 5% chance to spawn a boss instead of a normal enemy */
export function getEnemyForLevel(level: number, forceBoss = false): Enemy {
  if (forceBoss) {
    const boss = getBossForLevel(level);
    if (boss) return boss;
  }
  const eligible = ENEMIES.filter((e) => level >= e.minLevel && level <= e.maxLevel);
  if (eligible.length === 0) return ENEMIES[ENEMIES.length - 1];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical" | "divine" | "secret";

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythical", "divine", "secret"];

export const RARITY_CONFIG: Record<Rarity, { emoji: string; color: number; label: string; dropWeight: number }> = {
  common:    { emoji: "⚪", color: 0x999999, label: "Common",    dropWeight: 50 },
  uncommon:  { emoji: "🟢", color: 0x1eff00, label: "Uncommon",  dropWeight: 30 },
  rare:      { emoji: "🔵", color: 0x0070ff, label: "Rare",      dropWeight: 15 },
  epic:      { emoji: "🟣", color: 0xa335ee, label: "Epic",      dropWeight: 4 },
  legendary: { emoji: "🟠", color: 0xff8000, label: "Legendary", dropWeight: 1 },
  mythical:  { emoji: "🔴", color: 0xcc0000, label: "Mythical",  dropWeight: 0.5 },
  divine:    { emoji: "💛", color: 0xffd700, label: "Divine",    dropWeight: 0.2 },
  secret:    { emoji: "🌈", color: 0x00ffff, label: "Secret",    dropWeight: 0.05 },
};

export interface ItemDef {
  id: string;
  name: string;
  emoji: string;
  type: "potion" | "weapon" | "armor" | "buff" | "chest" | "gem";
  description: string;
  value: number;
  effect?: number;
  rarity: Rarity;
}

export const ITEMS: ItemDef[] = [
  // ════════════════════════════════════════
  //  COMMON
  // ════════════════════════════════════════
  { id: "hp_potion",      name: "Health Potion",    emoji: "❤️",  type: "potion", description: "Restore 30 HP",         value: 15,  effect: 30,   rarity: "common" },
  { id: "rusty_dagger",   name: "Rusty Dagger",     emoji: "🔪",  type: "weapon", description: "+2 Attack",            value: 20,  effect: 2,    rarity: "common" },
  { id: "wooden_club",    name: "Wooden Club",      emoji: "🏏",  type: "weapon", description: "+3 Attack",            value: 30,  effect: 3,    rarity: "common" },
  { id: "iron_sword",     name: "Iron Sword",       emoji: "🗡️",  type: "weapon", description: "+5 Attack",            value: 50,  effect: 5,    rarity: "common" },
  { id: "cloth_robe",     name: "Cloth Robe",       emoji: "👘",  type: "armor",  description: "+1 Defense",           value: 15,  effect: 1,    rarity: "common" },
  { id: "hide_vest",      name: "Hide Vest",        emoji: "🦺",  type: "armor",  description: "+2 Defense",           value: 30,  effect: 2,    rarity: "common" },
  { id: "leather_armor",  name: "Leather Armor",    emoji: "🧥",  type: "armor",  description: "+3 Defense",           value: 50,  effect: 3,    rarity: "common" },

  // ════════════════════════════════════════
  //  UNCOMMON
  // ════════════════════════════════════════
  { id: "super_potion",   name: "Super Potion",     emoji: "💖",  type: "potion", description: "Restore 75 HP",         value: 40,  effect: 75,   rarity: "uncommon" },
  { id: "antidote",       name: "Antidote",          emoji: "🧴",  type: "potion", description: "Restore 50 HP + cleanse", value: 35, effect: 50,  rarity: "uncommon" },
  { id: "battle_axe",     name: "Battle Axe",       emoji: "🪓",  type: "weapon", description: "+8 Attack",            value: 100, effect: 8,    rarity: "uncommon" },
  { id: "war_hammer",     name: "War Hammer",       emoji: "🔨",  type: "weapon", description: "+10 Attack",           value: 120, effect: 10,   rarity: "uncommon" },
  { id: "steel_blade",    name: "Steel Blade",      emoji: "⚔️",  type: "weapon", description: "+12 Attack",           value: 150, effect: 12,   rarity: "uncommon" },
  { id: "scale_armor",    name: "Scale Armor",      emoji: "🐟",  type: "armor",  description: "+5 Defense",           value: 100, effect: 5,    rarity: "uncommon" },
  { id: "iron_helm",      name: "Iron Helm",        emoji: "⛑️",  type: "armor",  description: "+6 Defense",           value: 120, effect: 6,    rarity: "uncommon" },
  { id: "chain_mail",     name: "Chain Mail",       emoji: "🛡️",  type: "armor",  description: "+8 Defense",           value: 150, effect: 8,    rarity: "uncommon" },

  // ════════════════════════════════════════
  //  RARE
  // ════════════════════════════════════════
  { id: "full_restore",   name: "Full Restore",     emoji: "✨",  type: "potion", description: "Fully restore HP",       value: 100, effect: 9999, rarity: "rare" },
  { id: "regen_potion",   name: "Regen Potion",     emoji: "💚",  type: "potion", description: "Restore 150 HP",         value: 80,  effect: 150,  rarity: "rare" },
  { id: "luck_potion",    name: "Luck Potion",      emoji: "🍀",  type: "buff",   description: "3x drop rate for 3 battles",  value: 200, effect: 3,   rarity: "rare" },
  { id: "xp_potion",      name: "XP Potion",        emoji: "📈",  type: "buff",   description: "3x XP for 3 battles",        value: 200, effect: 3,   rarity: "rare" },
  { id: "frost_blade",    name: "Frost Blade",      emoji: "❄️",  type: "weapon", description: "+18 Attack",           value: 300, effect: 18,   rarity: "rare" },
  { id: "thunder_hammer", name: "Thunder Hammer",   emoji: "⚡",  type: "weapon", description: "+20 Attack",           value: 350, effect: 20,   rarity: "rare" },
  { id: "mythril_sword",  name: "Mythril Sword",    emoji: "🔪",  type: "weapon", description: "+25 Attack",           value: 400, effect: 25,   rarity: "rare" },
  { id: "frost_mail",     name: "Frost Mail",       emoji: "❄️",  type: "armor",  description: "+10 Defense",          value: 300, effect: 10,   rarity: "rare" },
  { id: "thunder_guard",  name: "Thunder Guard",    emoji: "⚡",  type: "armor",  description: "+12 Defense",          value: 350, effect: 12,   rarity: "rare" },
  { id: "plate_armor",    name: "Plate Armor",      emoji: "🥋",  type: "armor",  description: "+15 Defense",          value: 400, effect: 15,   rarity: "rare" },

  // ════════════════════════════════════════
  //  EPIC
  // ════════════════════════════════════════
  { id: "horde_potion",   name: "Horde Potion",     emoji: "👾",  type: "buff",   description: "Spawn 3 enemies in your next battle",   value: 300, effect: 3,   rarity: "epic" },
  { id: "shadow_blade",   name: "Shadow Blade",     emoji: "🌑",  type: "weapon", description: "+30 Attack",           value: 600, effect: 30,   rarity: "epic" },
  { id: "lightbringer",   name: "Lightbringer",     emoji: "☀️",  type: "weapon", description: "+35 Attack",           value: 700, effect: 35,   rarity: "epic" },
  { id: "flame_sword",    name: "Flame Sword",      emoji: "⚔️",  type: "weapon", description: "+40 Attack",           value: 800, effect: 40,   rarity: "epic" },
  { id: "shadow_cloak",   name: "Shadow Cloak",     emoji: "🌑",  type: "armor",  description: "+18 Defense",          value: 600, effect: 18,   rarity: "epic" },
  { id: "light_plate",    name: "Light Plate",      emoji: "☀️",  type: "armor",  description: "+20 Defense",          value: 700, effect: 20,   rarity: "epic" },
  { id: "dragon_scale",   name: "Dragon Scale",     emoji: "🛡️",  type: "armor",  description: "+22 Defense",          value: 800, effect: 22,   rarity: "epic" },

  // ════════════════════════════════════════
  //  LEGENDARY
  // ════════════════════════════════════════
  { id: "phoenix_down",   name: "Phoenix Down",     emoji: "🔥",  type: "potion", description: "Revive to 50% HP",          value: 600, effect: 9999, rarity: "legendary" },
  { id: "elixir_power",   name: "Elixir of Power",  emoji: "⚡",  type: "buff",   description: "+20 Attack for 3 battles",      value: 800, effect: 3,   rarity: "legendary" },
  { id: "abyssal_scythe", name: "Abyssal Scythe",   emoji: "🌙",  type: "weapon", description: "+50 Attack",           value: 1200, effect: 50,  rarity: "legendary" },
  { id: "frostmourne",    name: "Frostmourne",      emoji: "❄️",  type: "weapon", description: "+55 Attack",           value: 1350, effect: 55,  rarity: "legendary" },
  { id: "dragon_slayer",  name: "Dragon Slayer",    emoji: "🗡️",  type: "weapon", description: "+60 Attack",           value: 1500, effect: 60,  rarity: "legendary" },
  { id: "abyssal_plate",  name: "Abyssal Plate",    emoji: "🌙",  type: "armor",  description: "+28 Defense",          value: 1200, effect: 28,  rarity: "legendary" },
  { id: "frozen_guard",   name: "Frozen Guard",     emoji: "❄️",  type: "armor",  description: "+32 Defense",          value: 1350, effect: 32,  rarity: "legendary" },
  { id: "void_armor",     name: "Void Armor",       emoji: "🖤",  type: "armor",  description: "+35 Defense",          value: 1500, effect: 35,  rarity: "legendary" },

  // ════════════════════════════════════════
  //  MYTHICAL
  // ════════════════════════════════════════
  { id: "elixir_immortal",  name: "Elixir of Immortality", emoji: "🧪", type: "potion", description: "Fully restore HP + gain 50 temp HP for 1 battle", value: 2000, effect: 9999, rarity: "mythical" },
  { id: "berserker_potion", name: "Berserker Brew",         emoji: "🍺", type: "buff",   description: "+35 Attack for 3 battles (but -10 Def)",        value: 1500, effect: 3,   rarity: "mythical" },
  { id: "soul_reaper",      name: "Soul Reaper",            emoji: "💀", type: "weapon", description: "+75 Attack",       value: 2500, effect: 75,  rarity: "mythical" },
  { id: "eclipse_blade",    name: "Eclipse Blade",          emoji: "🌘", type: "weapon", description: "+80 Attack",       value: 2750, effect: 80,  rarity: "mythical" },
  { id: "celestial_saber",  name: "Celestial Saber",        emoji: "⚔️", type: "weapon", description: "+85 Attack",       value: 3000, effect: 85,  rarity: "mythical" },
  { id: "soul_armor",       name: "Soul Armor",             emoji: "💀", type: "armor",  description: "+42 Defense",      value: 2500, effect: 42,  rarity: "mythical" },
  { id: "eclipse_guard",    name: "Eclipse Guard",          emoji: "🌘", type: "armor",  description: "+46 Defense",      value: 2750, effect: 46,  rarity: "mythical" },
  { id: "starweave_cloak",  name: "Starweave Cloak",        emoji: "🌌", type: "armor",  description: "+50 Defense",      value: 3000, effect: 50,  rarity: "mythical" },

  // ════════════════════════════════════════
  //  DIVINE
  // ════════════════════════════════════════
  { id: "nectar_gods",      name: "Nectar of the Gods",  emoji: "🍯", type: "potion", description: "Fully restore HP",              value: 5000, effect: 9999, rarity: "divine" },
  { id: "divine_blessing",  name: "Divine Blessing",     emoji: "✨", type: "buff",   description: "All buffs for 5 battles",        value: 4000, effect: 5,   rarity: "divine" },
  { id: "celestial_fury",   name: "Celestial Fury",      emoji: "⭐", type: "weapon", description: "+105 Attack",      value: 6000, effect: 105, rarity: "divine" },
  { id: "starfall",         name: "Starfall",            emoji: "☄️", type: "weapon", description: "+115 Attack",      value: 7000, effect: 115, rarity: "divine" },
  { id: "godslayer",        name: "Godslayer",           emoji: "⚡", type: "weapon", description: "+120 Attack",      value: 8000, effect: 120, rarity: "divine" },
  { id: "cosmic_edge",      name: "Cosmic Edge",         emoji: "🌠", type: "weapon", description: "+125 Attack",      value: 8500, effect: 125, rarity: "divine" },
  { id: "celestial_plate",  name: "Celestial Plate",     emoji: "⭐", type: "armor",  description: "+60 Defense",     value: 6000, effect: 60,  rarity: "divine" },
  { id: "starforged_shield",name: "Starforged Shield",   emoji: "☄️", type: "armor",  description: "+65 Defense",     value: 7000, effect: 65,  rarity: "divine" },
  { id: "aegis_divine",     name: "Divine Aegis",        emoji: "🛡️", type: "armor",  description: "+70 Defense",     value: 8000, effect: 70,  rarity: "divine" },

  // ════════════════════════════════════════
  //  SECRET
  // ════════════════════════════════════════
  { id: "primordial_essence", name: "Primordial Essence", emoji: "🌀", type: "potion", description: "Fully restore HP + permanent +5 max HP", value: 15000, effect: 9999, rarity: "secret" },
  { id: "timeless_elixir",    name: "Timeless Elixir",    emoji: "⏳", type: "potion", description: "Fully restore HP + all current buffs +3", value: 18000, effect: 9999, rarity: "secret" },
  { id: "reality_end",        name: "Reality's End",      emoji: "🌋", type: "weapon", description: "+160 Attack",      value: 16000, effect: 160, rarity: "secret" },
  { id: "infinite_edge",      name: "Infinite Edge",      emoji: "🌀", type: "weapon", description: "+175 Attack",      value: 18000, effect: 175, rarity: "secret" },
  { id: "world_end",          name: "World's End",        emoji: "🌋", type: "weapon", description: "+190 Attack",      value: 20000, effect: 190, rarity: "secret" },
  { id: "absolute_zero",      name: "Absolute Zero",      emoji: "❄️", type: "armor",  description: "+90 Defense",     value: 16000, effect: 90,  rarity: "secret" },
  { id: "infinite_shell",     name: "Infinite Shell",     emoji: "🌀", type: "armor",  description: "+95 Defense",     value: 18000, effect: 95,  rarity: "secret" },
  { id: "echo_void",          name: "Echo of the Void",   emoji: "🕳️", type: "armor",  description: "+100 Defense",    value: 20000, effect: 100, rarity: "secret" },

  // ════════════════════════════════════════
  //  MORE WEAPONS
  // ════════════════════════════════════════
  { id: "crystal_sword",   name: "Crystal Sword",    emoji: "🔮", type: "weapon", description: "+7 Attack",             value: 80,   effect: 7,   rarity: "common" },
  { id: "bone_club",       name: "Bone Club",        emoji: "🦴", type: "weapon", description: "+4 Attack",             value: 40,   effect: 4,   rarity: "common" },
  { id: "silver_rapier",   name: "Silver Rapier",    emoji: "🗡️", type: "weapon", description: "+15 Attack",            value: 250,  effect: 15,  rarity: "uncommon" },
  { id: "venom_stinger",   name: "Venom Stinger",    emoji: "🐍", type: "weapon", description: "+22 Attack",            value: 450,  effect: 22,  rarity: "rare" },
  { id: "inferno_blade",   name: "Inferno Blade",    emoji: "🔥", type: "weapon", description: "+45 Attack",            value: 900,  effect: 45,  rarity: "epic" },
  { id: "storm_bringer",   name: "Storm Bringer",    emoji: "⛈️", type: "weapon", description: "+65 Attack",            value: 2000, effect: 65,  rarity: "legendary" },
  { id: "void_scythe",     name: "Void Scythe",      emoji: "🌀", type: "weapon", description: "+90 Attack",            value: 3500, effect: 90,  rarity: "mythical" },
  { id: "heavens_fall",    name: "Heaven's Fall",    emoji: "☀️", type: "weapon", description: "+130 Attack",           value: 9000, effect: 130, rarity: "divine" },
  { id: "stone_hatchet",   name: "Stone Hatchet",    emoji: "🪨", type: "weapon", description: "+4 Attack",             value: 35,   effect: 4,   rarity: "common" },
  { id: "training_sword",  name: "Training Sword",   emoji: "⚔️", type: "weapon", description: "+6 Attack",             value: 60,   effect: 6,   rarity: "common" },
  { id: "rune_knife",      name: "Rune Knife",       emoji: "🔪", type: "weapon", description: "+14 Attack",            value: 200,  effect: 14,  rarity: "uncommon" },
  { id: "barbarian_axe",   name: "Barbarian Axe",    emoji: "🪓", type: "weapon", description: "+11 Attack",            value: 130,  effect: 11,  rarity: "uncommon" },
  { id: "rune_blade",      name: "Rune Blade",       emoji: "🔷", type: "weapon", description: "+24 Attack",            value: 500,  effect: 24,  rarity: "rare" },
  { id: "arcane_staff",    name: "Arcane Staff",     emoji: "🔮", type: "weapon", description: "+21 Attack",            value: 420,  effect: 21,  rarity: "rare" },
  { id: "rune_greatsword", name: "Rune Greatsword",  emoji: "⚔️", type: "weapon", description: "+42 Attack",            value: 950,  effect: 42,  rarity: "epic" },
  { id: "arcane_blade",    name: "Arcane Blade",     emoji: "💠", type: "weapon", description: "+38 Attack",            value: 850,  effect: 38,  rarity: "epic" },
  { id: "rune_hammer",     name: "Rune Hammer",      emoji: "🔨", type: "weapon", description: "+62 Attack",            value: 1600, effect: 62,  rarity: "legendary" },
  { id: "nightfall",       name: "Nightfall",        emoji: "🌙", type: "weapon", description: "+58 Attack",            value: 1400, effect: 58,  rarity: "legendary" },
  { id: "rift_blade",      name: "Rift Blade",       emoji: "🌀", type: "weapon", description: "+88 Attack",            value: 3200, effect: 88,  rarity: "mythical" },
  { id: "eternity",        name: "Eternity",         emoji: "♾️", type: "weapon", description: "+95 Attack",            value: 3600, effect: 95,  rarity: "mythical" },
  { id: "primal_fury",     name: "Primal Fury",      emoji: "🌋", type: "weapon", description: "+135 Attack",           value: 9500, effect: 135, rarity: "divine" },
  { id: "starlight",       name: "Starlight",        emoji: "⭐", type: "weapon", description: "+140 Attack",           value: 10000, effect: 140, rarity: "divine" },
  { id: "oblivion_edge",   name: "Oblivion Edge",    emoji: "🕳️", type: "weapon", description: "+200 Attack",           value: 22000, effect: 200, rarity: "secret" },
  { id: "singularity",     name: "Singularity",      emoji: "🌌", type: "weapon", description: "+210 Attack",           value: 25000, effect: 210, rarity: "secret" },

  // ════════════════════════════════════════
  //  MORE ARMOR
  // ════════════════════════════════════════
  { id: "wooden_shield",   name: "Wooden Shield",    emoji: "🪵", type: "armor",  description: "+1 Defense",            value: 20,   effect: 1,   rarity: "common" },
  { id: "bone_armor",      name: "Bone Armor",       emoji: "🦴", type: "armor",  description: "+4 Defense",            value: 80,   effect: 4,   rarity: "uncommon" },
  { id: "silver_mail",     name: "Silver Mail",      emoji: "⚪", type: "armor",  description: "+14 Defense",           value: 450,  effect: 14,  rarity: "rare" },
  { id: "inferno_guard",   name: "Inferno Guard",    emoji: "🔥", type: "armor",  description: "+25 Defense",           value: 900,  effect: 25,  rarity: "epic" },
  { id: "storm_shield",    name: "Storm Shield",     emoji: "⛈️", type: "armor",  description: "+38 Defense",           value: 2000, effect: 38,  rarity: "legendary" },
  { id: "void_mantle",     name: "Void Mantle",      emoji: "🌀", type: "armor",  description: "+55 Defense",           value: 3500, effect: 55,  rarity: "mythical" },
  { id: "heavens_bulwark", name: "Heaven's Bulwark", emoji: "☀️", type: "armor",  description: "+75 Defense",           value: 9000, effect: 75,  rarity: "divine" },
  { id: "straw_cape",      name: "Straw Cape",       emoji: "🧺", type: "armor",  description: "+1 Defense",            value: 18,   effect: 1,   rarity: "common" },
  { id: "patchwork_vest",  name: "Patchwork Vest",   emoji: "🧥", type: "armor",  description: "+2 Defense",            value: 35,   effect: 2,   rarity: "common" },
  { id: "iron_bracers",    name: "Iron Bracers",     emoji: "⛓️", type: "armor",  description: "+7 Defense",            value: 140,  effect: 7,   rarity: "uncommon" },
  { id: "rune_cape",       name: "Rune Cape",        emoji: "🔷", type: "armor",  description: "+6 Defense",            value: 110,  effect: 6,   rarity: "uncommon" },
  { id: "rune_plate",      name: "Rune Plate",       emoji: "🛡️", type: "armor",  description: "+13 Defense",           value: 380,  effect: 13,  rarity: "rare" },
  { id: "arcane_robe",     name: "Arcane Robe",      emoji: "🔮", type: "armor",  description: "+11 Defense",           value: 320,  effect: 11,  rarity: "rare" },
  { id: "rune_guard",      name: "Rune Guard",       emoji: "⚔️", type: "armor",  description: "+24 Defense",           value: 880,  effect: 24,  rarity: "epic" },
  { id: "arcane_shield",   name: "Arcane Shield",    emoji: "💠", type: "armor",  description: "+21 Defense",           value: 750,  effect: 21,  rarity: "epic" },
  { id: "rune_armor",      name: "Rune Armor",       emoji: "🔨", type: "armor",  description: "+36 Defense",           value: 1450, effect: 36,  rarity: "legendary" },
  { id: "eternal_guard",   name: "Eternal Guard",    emoji: "♾️", type: "armor",  description: "+34 Defense",           value: 1300, effect: 34,  rarity: "legendary" },
  { id: "rift_plate",      name: "Rift Plate",       emoji: "🌀", type: "armor",  description: "+52 Defense",           value: 3000, effect: 52,  rarity: "mythical" },
  { id: "eternity_cloak",  name: "Eternity Cloak",   emoji: "♾️", type: "armor",  description: "+48 Defense",           value: 2800, effect: 48,  rarity: "mythical" },
  { id: "primal_aegis",    name: "Primal Aegis",     emoji: "🌋", type: "armor",  description: "+72 Defense",           value: 8500, effect: 72,  rarity: "divine" },
  { id: "starlight_plate", name: "Starlight Plate",  emoji: "⭐", type: "armor",  description: "+68 Defense",           value: 7800, effect: 68,  rarity: "divine" },
  { id: "oblivion_guard",  name: "Oblivion Guard",   emoji: "🕳️", type: "armor",  description: "+105 Defense",          value: 21000, effect: 105, rarity: "secret" },
  { id: "singularity_shell",name: "Singularity Shell",emoji: "🌌", type: "armor",  description: "+110 Defense",          value: 24000, effect: 110, rarity: "secret" },

  // ════════════════════════════════════════
  //  MORE POTIONS
  // ════════════════════════════════════════
  { id: "minor_heal",      name: "Minor Heal",       emoji: "💗", type: "potion", description: "Restore 15 HP",          value: 8,    effect: 15,  rarity: "common" },
  { id: "mega_potion",     name: "Mega Potion",      emoji: "💜", type: "potion", description: "Restore 250 HP",         value: 200,  effect: 250, rarity: "rare" },
  { id: "ultra_potion",    name: "Ultra Potion",     emoji: "🔮", type: "potion", description: "Restore 500 HP",         value: 500,  effect: 500, rarity: "epic" },
  { id: "elixir_rebirth",  name: "Elixir of Rebirth",emoji: "🔄", type: "potion", description: "Fully restore HP + remove all debuffs", value: 1000, effect: 9999, rarity: "legendary" },
  { id: "philosopher_stone", name: "Philosopher's Stone", emoji: "🧪", type: "potion", description: "Permanently +20 max HP", value: 5000, effect: 9999, rarity: "mythical" },
  { id: "herb_poultice",    name: "Herb Poultice",       emoji: "🌿", type: "potion", description: "Restore 20 HP",          value: 10,   effect: 20,  rarity: "common" },
  { id: "healing_salve",    name: "Healing Salve",        emoji: "🧴", type: "potion", description: "Restore 60 HP",          value: 50,   effect: 60,  rarity: "uncommon" },
  { id: "greater_potion",   name: "Greater Potion",       emoji: "💙", type: "potion", description: "Restore 200 HP",         value: 250,  effect: 200, rarity: "rare" },
  { id: "ancient_potion",   name: "Ancient Potion",       emoji: "🏺", type: "potion", description: "Restore 400 HP",         value: 650,  effect: 400, rarity: "epic" },
  { id: "divine_potion",    name: "Divine Potion",        emoji: "💫", type: "potion", description: "Fully restore + 50 temp HP", value: 2000, effect: 9999, rarity: "legendary" },
  { id: "eternal_elixir",   name: "Eternal Elixir",       emoji: "♾️", type: "potion", description: "Fully restore + permanent +10 max HP", value: 8000, effect: 9999, rarity: "mythical" },
  { id: "cosmic_renewal",   name: "Cosmic Renewal",       emoji: "🌌", type: "potion", description: "Fully restore + all buffs +3",           value: 12000, effect: 9999, rarity: "divine" },
  { id: "absolute_essence", name: "Absolute Essence",     emoji: "🌀", type: "potion", description: "Fully restore + permanent +25 max HP",   value: 30000, effect: 9999, rarity: "secret" },

  // ════════════════════════════════════════
  //  MORE BUFFS
  // ════════════════════════════════════════
  { id: "fortitude_potion", name: "Fortitude Potion", emoji: "🛡️", type: "buff",  description: "+15 Defense for 3 battles", value: 400,  effect: 3,   rarity: "rare" },
  { id: "rage_potion",      name: "Rage Potion",      emoji: "❤️‍🔥", type: "buff",  description: "+50 Attack for 2 battles (no def penalty)", value: 1200, effect: 2, rarity: "epic" },
  { id: "guardian_elixir",  name: "Guardian Elixir",  emoji: "🏰", type: "buff",  description: "+30 Defense for 4 battles", value: 2500, effect: 4,   rarity: "legendary" },
  { id: "overdrive_potion", name: "Overdrive Potion", emoji: "⚡", type: "buff",  description: "+100 Attack for 2 battles", value: 6000, effect: 2,   rarity: "mythical" },
  { id: "sharpshooter_potion", name: "Sharpshooter Potion", emoji: "🎯", type: "buff",  description: "+10 Attack for 4 battles",  value: 350,  effect: 4,   rarity: "rare" },
  { id: "barrier_potion",      name: "Barrier Potion",      emoji: "🛡️", type: "buff",  description: "+10 Defense for 4 battles", value: 350,  effect: 4,   rarity: "rare" },
  { id: "frenzy_potion",       name: "Frenzy Potion",       emoji: "💢", type: "buff",  description: "+40 Attack for 3 battles",  value: 1000, effect: 3,   rarity: "epic" },
  { id: "bulwark_potion",      name: "Bulwark Potion",      emoji: "🏰", type: "buff",  description: "+20 Defense for 4 battles", value: 1100, effect: 4,   rarity: "epic" },
  { id: "titan_potion",        name: "Titan Potion",        emoji: "🗿", type: "buff",  description: "+40 Atk & +20 Def for 4 battles", value: 3000, effect: 4,   rarity: "legendary" },
  { id: "godmode_potion",      name: "Godmode Potion",      emoji: "✨", type: "buff",  description: "+200 Atk & +100 Def for 1 battle", value: 10000, effect: 1,   rarity: "mythical" },

  // ════════════════════════════════════════
  //  MORE GEMS
  // ════════════════════════════════════════
  { id: "tiny_xp_gem",      name: "Tiny XP Gem",      emoji: "💎", type: "gem", description: "1.5x XP multiplier",      value: 200,  effect: 1.5,   rarity: "common" },
  { id: "minor_xp_gem",     name: "Minor XP Gem",     emoji: "💠", type: "gem", description: "2x XP multiplier",        value: 500,  effect: 2,     rarity: "uncommon" },
  { id: "xp_gem",           name: "XP Gem",           emoji: "🔷", type: "gem", description: "3x XP multiplier",        value: 1500, effect: 3,     rarity: "rare" },
  { id: "greater_xp_gem",   name: "Greater XP Gem",   emoji: "💎", type: "gem", description: "5x XP multiplier",        value: 4000, effect: 5,     rarity: "epic" },
  { id: "major_xp_gem",     name: "Major XP Gem",     emoji: "🔶", type: "gem", description: "10x XP multiplier",       value: 10000, effect: 10,    rarity: "legendary" },
  { id: "supreme_xp_gem",   name: "Supreme XP Gem",   emoji: "💥", type: "gem", description: "25x XP multiplier",       value: 25000, effect: 25,    rarity: "mythical" },
  { id: "monarch_xp_gem",   name: "Monarch XP Gem",   emoji: "👑", type: "gem", description: "100x XP multiplier",      value: 100000, effect: 100,   rarity: "divine" },
  { id: "celestial_xp_gem", name: "Celestial XP Gem", emoji: "🌈", type: "gem", description: "10000x XP multiplier",     value: 999999, effect: 10000, rarity: "secret" },
  { id: "fractured_xp_gem", name: "Fractured XP Gem", emoji: "🪨", type: "gem", description: "1.2x XP multiplier",       value: 80,   effect: 1.2,   rarity: "common" },
  { id: "flawed_xp_gem",    name: "Flawed XP Gem",    emoji: "💎", type: "gem", description: "1.35x XP multiplier",      value: 120,  effect: 1.35,  rarity: "common" },
  { id: "polished_xp_gem",  name: "Polished XP Gem",  emoji: "💠", type: "gem", description: "2.5x XP multiplier",       value: 800,  effect: 2.5,   rarity: "uncommon" },
  { id: "radiant_xp_gem",   name: "Radiant XP Gem",   emoji: "✨", type: "gem", description: "4x XP multiplier",         value: 2500, effect: 4,     rarity: "rare" },
  { id: "brilliant_xp_gem", name: "Brilliant XP Gem", emoji: "🔆", type: "gem", description: "7.5x XP multiplier",       value: 7000, effect: 7.5,   rarity: "epic" },

  // ════════════════════════════════════════
  //  CHESTS — contain random weapon or armor of matching rarity
  // ════════════════════════════════════════
  { id: "common_chest",      name: "Common Chest",      emoji: "📦", type: "chest", description: "Contains a random Common item",    value: 50,   rarity: "common" },
  { id: "uncommon_chest",    name: "Uncommon Chest",    emoji: "📦", type: "chest", description: "Contains a random Uncommon item",  value: 150,  rarity: "uncommon" },
  { id: "rare_chest",        name: "Rare Chest",        emoji: "🎁", type: "chest", description: "Contains a random Rare item",      value: 400,  rarity: "rare" },
  { id: "epic_chest",        name: "Epic Chest",        emoji: "🧰", type: "chest", description: "Contains a random Epic item",      value: 1000, rarity: "epic" },
  { id: "legendary_chest",   name: "Legendary Chest",   emoji: "🏆", type: "chest", description: "Contains a random Legendary item", value: 3000, rarity: "legendary" },
  { id: "mythical_chest",    name: "Mythical Chest",    emoji: "🗝️", type: "chest", description: "Contains a random Mythical item",  value: 8000, rarity: "mythical" },
  { id: "divine_chest",      name: "Divine Chest",      emoji: "✨", type: "chest", description: "Contains a random Divine item",    value: 25000, rarity: "divine" },
  { id: "secret_chest",      name: "Secret Chest",      emoji: "🌀", type: "chest", description: "Contains a random Secret item",    value: 100000, rarity: "secret" },
  { id: "reinforced_chest",  name: "Reinforced Chest",  emoji: "📫", type: "chest", description: "Contains a Rare+ weapon or armor",   value: 600,  rarity: "rare" },
  { id: "celestial_chest",   name: "Celestial Chest",   emoji: "🌟", type: "chest", description: "Contains any Legendary+ item",       value: 5000, rarity: "legendary" },
  { id: "void_chest",        name: "Void Chest",        emoji: "🕳️", type: "chest", description: "Contains any Mythical+ item",        value: 15000, rarity: "mythical" },
];

/** All items that can drop from battles. Chests and gems can drop too. */
function droppableItems(): ItemDef[] {
  return ITEMS.filter((i) => {
    if (i.type === "weapon" || i.type === "armor") return true;
    if (i.type === "chest" || i.type === "gem") return true;
    if (i.type === "buff") return RARITY_ORDER.indexOf(i.rarity) >= RARITY_ORDER.indexOf("epic");
    if (i.type === "potion") return RARITY_ORDER.indexOf(i.rarity) >= RARITY_ORDER.indexOf("legendary");
    return false;
  });
}

/** Get the XP multiplier from a gem ID. Returns 1 if not a gem. */
export function getGemMultiplier(gemId: string | null): number {
  if (!gemId) return 1;
  const gem = ITEMS.find((i) => i.id === gemId && i.type === "gem");
  return gem?.effect ?? 1;
}

/** Open a chest: returns a random weapon or armor item of the same rarity as the chest. */
export function openChest(chestRarity: Rarity): ItemDef | null {
  const pool = ITEMS.filter(
    (i) => (i.type === "weapon" || i.type === "armor") && i.rarity === chestRarity
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Returns a random drop based on rarity weights. Luck multiplies the roll for rare+ items. */
export function getRandomDrop(luckMultiplier = 1): ItemDef | null {
  const drops = droppableItems();
  if (drops.length === 0) return null;

  const weights = drops.map((item) => RARITY_CONFIG[item.rarity].dropWeight);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < drops.length; i++) {
    const rarityIdx = RARITY_ORDER.indexOf(drops[i].rarity);
    const adjusted = weights[i] * (luckMultiplier > 1 && rarityIdx >= RARITY_ORDER.indexOf("rare") ? luckMultiplier : 1);
    roll -= adjusted;
    if (roll <= 0) return drops[i];
  }
  return drops[drops.length - 1];
}

/** Format an item's rarity for display. */
export function formatRarity(rarity: Rarity): string {
  const cfg = RARITY_CONFIG[rarity];
  return `${cfg.emoji} **${cfg.label}**`;
}

/** Get a color for a given rarity. */
export function rarityColor(rarity: Rarity): number {
  return RARITY_CONFIG[rarity].color;
}
