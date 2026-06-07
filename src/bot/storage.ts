import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");
const DATA_FILE = join(DATA_DIR, "bot-data.json");

interface StarboardConfig {
  enabled: boolean;
  channelId: string | null;
}

export interface PurchaseEntry {
  tier: string; // e.g. "Tier 1"
  roleId: string;
  price: number;
  timestamp: number;
}

export interface CustomReactionRoleMapping {
  emoji: string;   // unicode character or custom emoji name:id
  roleId: string;
  isCustom: boolean; // true if it's a custom Discord emoji
}

interface GuildData {
  roles: Record<string, string>; // userId -> roleId
  starboard: StarboardConfig;
  balances?: Record<string, number>; // userId -> coins
  cuteCoins?: Record<string, number>; // userId -> cute coins (from chatting)
  purchases?: Record<string, PurchaseEntry[]>; // userId -> purchases
  battle?: Record<string, BattlePlayer>; // userId -> battle player data
  customReactionRoles?: Record<string, CustomReactionRoleMapping[]>; // messageId -> mappings
  huntadminAuth?: string[]; // user IDs authorized to use huntadmin
}

interface StorageData {
  [guildId: string]: GuildData;
}

function ensureFile(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, JSON.stringify({}), "utf-8");
}

export function load(): StorageData {
  try {
    ensureFile();
    return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as StorageData;
  } catch {
    return {};
  }
}

function save(data: StorageData): void {
  ensureFile();
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getGuild(data: StorageData, guildId: string): GuildData {
  if (!data[guildId]) {
    data[guildId] = { roles: {}, starboard: { enabled: false, channelId: null } };
  }
  return data[guildId];
}

// ── Role ownership ────────────────────────────────────────────────────────────

export function getOwnerRole(guildId: string, userId: string): string | undefined {
  return load()[guildId]?.roles[userId];
}

export function setOwnerRole(guildId: string, userId: string, roleId: string): void {
  const data = load();
  getGuild(data, guildId).roles[userId] = roleId;
  save(data);
}

export function removeOwnerRole(guildId: string, userId: string): void {
  const data = load();
  if (data[guildId]) {
    delete data[guildId].roles[userId];
    save(data);
  }
}

// ── Economy ───────────────────────────────────────────────────────────────────
export function getBalance(guildId: string, userId: string): number {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.balances = guild.balances ?? {};
  return guild.balances[userId] ?? 0;
}

export function addBalance(guildId: string, userId: string, amount: number): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.balances = guild.balances ?? {};
  guild.balances[userId] = (guild.balances[userId] ?? 0) + amount;
  save(data);
}

export function setBalance(guildId: string, userId: string, amount: number): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.balances = guild.balances ?? {};
  guild.balances[userId] = amount;
  save(data);
}

// ── Cute Coins ─────────────────────────────────────────────────────────────────
export function getCuteCoins(guildId: string, userId: string): number {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.cuteCoins = guild.cuteCoins ?? {};
  return guild.cuteCoins[userId] ?? 0;
}

export function addCuteCoins(guildId: string, userId: string, amount: number): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.cuteCoins = guild.cuteCoins ?? {};
  guild.cuteCoins[userId] = (guild.cuteCoins[userId] ?? 0) + amount;
  save(data);
}

export function setCuteCoins(guildId: string, userId: string, amount: number): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.cuteCoins = guild.cuteCoins ?? {};
  guild.cuteCoins[userId] = amount;
  save(data);
}

// ── Full reset ─────────────────────────────────────────────────────────────────
export function resetAllBalances(guildId: string): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.balances = {};
  guild.cuteCoins = {};
  save(data);
}

export function getAllBalances(guildId: string): { userId: string; coins: number; cuteCoins: number }[] {
  const data = load();
  const guild = data[guildId];
  if (!guild) return [];
  const allUsers = new Set<string>();
  if (guild.balances) Object.keys(guild.balances).forEach((id) => allUsers.add(id));
  if (guild.cuteCoins) Object.keys(guild.cuteCoins).forEach((id) => allUsers.add(id));
  return Array.from(allUsers).map((userId) => ({
    userId,
    coins: guild.balances?.[userId] ?? 0,
    cuteCoins: guild.cuteCoins?.[userId] ?? 0,
  }));
}

// ── Purchase tracking (for refunds) ───────────────────────────────────────────

export function addPurchase(guildId: string, userId: string, purchase: PurchaseEntry): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.purchases = guild.purchases ?? {};
  guild.purchases[userId] = guild.purchases[userId] ?? [];
  guild.purchases[userId].push(purchase);
  save(data);
}

export function getPurchaseByTimestamp(guildId: string, userId: string, timestamp: number): PurchaseEntry | undefined {
  const data = load();
  return data[guildId]?.purchases?.[userId]?.find((p) => p.timestamp === timestamp);
}

export function removePurchase(guildId: string, userId: string, timestamp: number): void {
  const data = load();
  const guild = data[guildId];
  if (guild?.purchases?.[userId]) {
    guild.purchases[userId] = guild.purchases[userId].filter((p) => p.timestamp !== timestamp);
    save(data);
  }
}

// ── Battle system ─────────────────────────────────────────────────────────────

export interface BattlePlayer {
  level: number;
  xp: number;
  currentHp: number;
  maxHp: number;
  baseAtk: number;
  baseDef: number;
  weapon: string | null;
  armor: string | null;
  gemXp: string | null;
  inventory: Record<string, number>;
  battles: number;
  wins: number;
  streak: number;
  buffs: {
    luck: number;
    xp: number;
    horde: number;
    atkBoost: number;
    defBoost: number;
  };
  autohunt: boolean;
  autoChannel: string | null;
}

export function getBattlePlayer(guildId: string, userId: string): BattlePlayer {
  const data = load();
  const guild = getGuild(data, guildId);
  if (!guild.battle) {
    guild.battle = {};
  }
  if (!guild.battle[userId]) {
    const level = 1;
    guild.battle[userId] = {
      level,
      xp: 0,
      currentHp: 250,
      maxHp: 250,
      baseAtk: 8,
      baseDef: 3,
      weapon: null,
      armor: null,
      gemXp: null,
      inventory: { hp_potion: 3 },
      battles: 0,
      wins: 0,
      streak: 0,
      buffs: { luck: 0, xp: 0, horde: 0, atkBoost: 0, defBoost: 0 },
      autohunt: false,
      autoChannel: null,
    };
    save(data);
  } else {
      // Migrate existing players to add missing fields
      const p = guild.battle[userId];
      let changed = false;
      if (!p.weapon) { p.weapon = null; changed = true; }
      if (!p.armor) { p.armor = null; changed = true; }
      if (!p.gemXp && p.gemXp !== null) { p.gemXp = null; changed = true; }
      if (!p.inventory) { p.inventory = {}; changed = true; }
      if (!p.buffs) { p.buffs = { luck: 0, xp: 0, horde: 0, atkBoost: 0, defBoost: 0 }; changed = true; }
      if (p.buffs) {
      if (p.buffs.luck === undefined) { p.buffs.luck = 0; changed = true; }
      if (p.buffs.xp === undefined) { p.buffs.xp = 0; changed = true; }
      if (p.buffs.horde === undefined) { p.buffs.horde = 0; changed = true; }
      if (p.buffs.atkBoost === undefined) { p.buffs.atkBoost = 0; changed = true; }
      if (p.buffs.defBoost === undefined) { p.buffs.defBoost = 0; changed = true; }
    }
    if (p.autohunt === undefined) { p.autohunt = false; changed = true; }
    if (!p.autoChannel && p.autoChannel !== null) { p.autoChannel = null; changed = true; }
    if (p.maxHp !== 250) { p.maxHp = 250; p.currentHp = Math.min(p.currentHp, 250); changed = true; }
    if (changed) save(data);
  }
  return guild.battle[userId];
}

export function saveBattlePlayer(guildId: string, userId: string, player: BattlePlayer): void {
  const data = load();
  const guild = getGuild(data, guildId);
  if (!guild.battle) guild.battle = {};
  guild.battle[userId] = player;
  save(data);
}

export function getBattleLeaderboard(guildId: string): { userId: string; wins: number; level: number }[] {
  const data = load();
  const guild = data[guildId];
  if (!guild?.battle) return [];
  return Object.entries(guild.battle)
    .map(([userId, p]) => ({ userId, wins: p.wins, level: p.level }))
    .sort((a, b) => b.wins - a.wins || b.level - a.level)
    .slice(0, 10);
}

/** Returns the raw GuildData for a guild (for auto-battle iteration). */
export function getGuildRaw(guildId: string): GuildData | undefined {
  return load()[guildId];
}

// ── Changelog ─────────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export function getChangelog(): ChangelogEntry[] {
  const data = load() as any;
  return data.__changelog ?? [];
}

export function addChangelogEntry(entry: ChangelogEntry): void {
  const data = load() as any;
  data.__changelog = data.__changelog ?? [];
  data.__changelog.unshift(entry);
  save(data);
}

// ── Starboard config ──────────────────────────────────────────────────────────

export function getStarboardConfig(guildId: string): StarboardConfig {
  return load()[guildId]?.starboard ?? { enabled: false, channelId: null };
}

export function setStarboardEnabled(guildId: string, enabled: boolean): void {
  const data = load();
  getGuild(data, guildId).starboard.enabled = enabled;
  save(data);
}

export function setStarboardChannel(guildId: string, channelId: string): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.starboard.channelId = channelId;
  guild.starboard.enabled = true;
  save(data);
}

// ── Custom Reaction Roles ──────────────────────────────────────────────────────

export function getCustomReactionRoles(guildId: string, messageId: string): CustomReactionRoleMapping[] {
  const data = load();
  return data[guildId]?.customReactionRoles?.[messageId] ?? [];
}

export function getAllCustomReactionMessages(guildId: string): string[] {
  const data = load();
  return Object.keys(data[guildId]?.customReactionRoles ?? {});
}

export function setCustomReactionRole(guildId: string, messageId: string, emoji: string, roleId: string, isCustom: boolean): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.customReactionRoles = guild.customReactionRoles ?? {};
  guild.customReactionRoles[messageId] = guild.customReactionRoles[messageId] ?? [];
  const existing = guild.customReactionRoles[messageId].find((m) => m.emoji === emoji);
  if (existing) {
    existing.roleId = roleId;
  } else {
    guild.customReactionRoles[messageId].push({ emoji, roleId, isCustom });
  }
  save(data);
}

export function removeCustomReactionRole(guildId: string, messageId: string, emoji: string): boolean {
  const data = load();
  const guild = data[guildId];
  if (!guild?.customReactionRoles?.[messageId]) return false;
  const before = guild.customReactionRoles[messageId].length;
  guild.customReactionRoles[messageId] = guild.customReactionRoles[messageId].filter((m) => m.emoji !== emoji);
  save(data);
  return guild.customReactionRoles[messageId].length < before;
}

export function findCustomReactionRole(guildId: string, messageId: string, emojiName: string, emojiId: string | null): CustomReactionRoleMapping | undefined {
  const data = load();
  const mappings = data[guildId]?.customReactionRoles?.[messageId];
  if (!mappings) return undefined;
  // For unicode emoji: match by emoji name (the character itself)
  // For custom emoji: match by "name:id" string
  const lookupKey = emojiId ? `${emojiName}:${emojiId}` : emojiName;
  return mappings.find((m) => m.emoji === lookupKey || (!m.isCustom && m.emoji === emojiName));
}

// ── Huntadmin Authorization ─────────────────────────────────────────────────

export function getHuntadminAuth(guildId: string): string[] {
  const data = load();
  return data[guildId]?.huntadminAuth ?? [];
}

export function setHuntadminAuth(guildId: string, userId: string, authorized: boolean): void {
  const data = load();
  const guild = getGuild(data, guildId);
  guild.huntadminAuth = guild.huntadminAuth ?? [];
  if (authorized) {
    if (!guild.huntadminAuth.includes(userId)) guild.huntadminAuth.push(userId);
  } else {
    guild.huntadminAuth = guild.huntadminAuth.filter((id) => id !== userId);
  }
  save(data);
}
