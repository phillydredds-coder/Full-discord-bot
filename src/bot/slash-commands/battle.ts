import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { getEnemyForLevel, ITEMS, getRandomDrop, ENEMIES, RARITY_ORDER, RARITY_CONFIG, formatRarity, getGemMultiplier } from "../battle-data.js";
import type { Enemy } from "../battle-data.js";

export const data = new SlashCommandBuilder()
  .setName("battle")
  .setDescription("Fight a random enemy for XP and loot");

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function levelUp(guildId: string, userId: string, p: storage.BattlePlayer): Promise<string[]> {
  const msgs: string[] = [];
  while (p.xp >= p.level * 50) {
    p.xp -= p.level * 50;
    p.level++;
    p.maxHp += 10;
    p.currentHp = p.maxHp;
    p.baseAtk += 2;
    p.baseDef += 1;
    msgs.push(`⭐ **Level Up!** You're now level **${p.level}**! (HP restored)`);
    if (p.level % 5 === 0) {
      const itemPool = ITEMS.filter((i) => i.type !== "potion" && i.type !== "buff");
      const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      p.inventory[randomItem.id] = (p.inventory[randomItem.id] ?? 0) + 1;
      msgs.push(`🎁 **Milestone reward!** You got a **${randomItem.name}**!`);
    }
  }
  return msgs;
}

async function fightEnemy(
  guildId: string,
  userId: string,
  enemy: Enemy,
  scaledEnemy: Enemy,
  p: storage.BattlePlayer,
  playerAtk: number,
  playerDef: number,
  playerHp: number,
  buffs: { luck: number; xp: number; horde: number },
): Promise<{ result: "win" | "loss"; playerHp: number; logs: string[]; p: storage.BattlePlayer }> {
  let enemyHp = scaledEnemy.hp;
  let hp = playerHp;
  const logs: string[] = [`${scaledEnemy.emoji} **${scaledEnemy.name}** appears! (❤️ ${scaledEnemy.hp} HP)`];

  while (enemyHp > 0 && hp > 0) {
    const dmg = Math.max(1, playerAtk - scaledEnemy.defense + random(-2, 4));
    enemyHp -= dmg;
    logs.push(`⚔️ You dealt **${dmg}** damage to ${scaledEnemy.name}!`);

    if (enemyHp <= 0) break;

    const enemyDmg = Math.max(1, Math.round((scaledEnemy.attack - playerDef * 0.5)) + random(-2, 3));
    hp -= enemyDmg;
    logs.push(`${scaledEnemy.emoji} ${scaledEnemy.name} dealt **${enemyDmg}** damage!`);
  }

  if (hp <= 0) {
    return { result: "loss", playerHp: 0, logs, p };
  }

  let xpGain = Math.round((scaledEnemy.xpReward + random(0, 10)) * (1 + p.streak * 0.15));
  const coinGain = Math.round((scaledEnemy.coinReward + random(0, 5)) * (1 + p.streak * 0.15));

  if (buffs.xp > 0) {
    xpGain *= 3;
    logs.push("📈 **XP boost active!** 3x XP!");
  }

  const gemMult = getGemMultiplier(p.gemXp);
  if (gemMult > 1) {
    const gemItem = p.gemXp ? ITEMS.find((i) => i.id === p.gemXp) : null;
    xpGain = Math.round(xpGain * gemMult);
    logs.push(`${gemItem?.emoji ?? "💎"} **XP Gem active!** ${gemMult}x XP!`);
  }

  p.xp += xpGain;
  storage.addBalance(guildId, userId, coinGain);
  p.battles++;
  p.wins++;
  p.streak++;
  p.currentHp = hp;

  const lvlMsgs = await levelUp(guildId, userId, p);
  storage.saveBattlePlayer(guildId, userId, p);

  logs.push(`🎉 **${scaledEnemy.name}** defeated! +**${xpGain}** XP, +**${coinGain}** coins`);
  logs.push(...lvlMsgs);

  const dropRate = buffs.luck > 0 ? Math.min(1, scaledEnemy.dropRate * 3) : Math.min(0.9, scaledEnemy.dropRate * (1 + p.streak * 0.08));
  if (Math.random() < dropRate) {
    const drop = getRandomDrop(buffs.luck > 0 ? 3 : 1);
    if (drop) {
      p = storage.getBattlePlayer(guildId, userId);
      p.inventory[drop.id] = (p.inventory[drop.id] ?? 0) + 1;
      storage.saveBattlePlayer(guildId, userId, p);
      logs.push(`🎁 **Drop!** ${buffs.luck > 0 ? "🍀 " : ""}You found a **${drop.name}**! (${formatRarity(drop.rarity)})`);
      if (RARITY_ORDER.indexOf(drop.rarity) >= RARITY_ORDER.indexOf("epic")) {
        logs.push(`🌟 **INCREDIBLE!** A **${RARITY_CONFIG[drop.rarity].label}** item!`);
      }
    }
  }

  return { result: "win", playerHp: hp, logs, p };
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;
  const userId = interaction.user.id;

  let p = storage.getBattlePlayer(guild.id, userId);
  p.currentHp = p.maxHp;
  storage.saveBattlePlayer(guild.id, userId, p);

  const weapon = p.weapon ? ITEMS.find((i) => i.id === p.weapon) : null;
  const armor = p.armor ? ITEMS.find((i) => i.id === p.armor) : null;
  const playerAtk = p.baseAtk + (weapon?.effect ?? 0) + (p.buffs.atkBoost || 0);
  const playerDef = p.baseDef + (armor?.effect ?? 0) + (p.buffs.defBoost || 0);

  const buffs = { ...p.buffs };
  const hordeCount = buffs.horde > 0 ? 3 : 1;
  let playerHp = p.currentHp;
  const allLogs: string[] = [];
  let wins = 0;
  let lost = false;

  if (buffs.luck > 0) allLogs.push("🍀 **Luck boost active!** Better drops!");
  if (buffs.xp > 0) allLogs.push("📈 **XP boost active!** 3x XP!");
  if (buffs.horde > 0) allLogs.push("👾 **Horde mode!** 3 enemies incoming!");
  if (buffs.atkBoost > 0) allLogs.push(`⚡ **+${buffs.atkBoost} Attack boost active!**`);
  if (buffs.defBoost < 0) allLogs.push(`🛡️ **${buffs.defBoost} Defense penalty active!**`);
  if (buffs.defBoost > 0) allLogs.push(`🛡️ **+${buffs.defBoost} Defense boost active!**`);

  for (let i = 0; i < hordeCount; i++) {
    if (playerHp <= 0) break;

    const isBoss = Math.random() < 0.05 && p.level >= 5;
    let enemy = isBoss ? getEnemyForLevel(p.level, true) : getEnemyForLevel(p.level);
    if (hordeCount > 1) {
      const diff = ENEMIES.indexOf(enemy);
      const offset = i === 0 ? 0 : i === 1 ? Math.max(0, diff - 1) : Math.min(ENEMIES.length - 1, diff + 1);
      enemy = ENEMIES[offset];
    }

    const scaledEnemy: Enemy = {
      ...enemy,
      hp: Math.round((enemy.hp + p.level * 2 + (hordeCount > 1 ? i * 5 : 0)) * (1 + p.streak * 0.12)),
      attack: Math.round((enemy.attack + Math.floor(p.level / 2)) * (1 + p.streak * 0.1)),
      defense: Math.round((enemy.defense + Math.floor(p.level / 3)) * (1 + p.streak * 0.1)),
    };

    if (hordeCount > 1) allLogs.push(`\n**─── Wave ${i + 1}/${hordeCount} ───**`);
    if (isBoss) allLogs.push("👑 **BOSS ENCOUNTER!** ⚠️");

    const result = await fightEnemy(guild.id, userId, enemy, scaledEnemy, p, playerAtk, playerDef, playerHp, buffs);
    allLogs.push(...result.logs);

    if (result.result === "loss") {
      lost = true;
      playerHp = 0;

      const lossPenalty = Math.min(50, Math.floor(p.battles * 2));
      allLogs.push(`💔 **You fainted on wave ${i + 1}!** Lost **${lossPenalty}** coins...`);
      storage.addBalance(guild.id, userId, -lossPenalty);
      p.streak = 0;
      p.currentHp = 0;
      storage.saveBattlePlayer(guild.id, userId, p);
      break;
    }

    wins++;
    playerHp = result.playerHp;
    p = result.p;
  }

  if (wins > 0) {
    p = storage.getBattlePlayer(guild.id, userId);
    if (p.buffs.luck > 0) p.buffs.luck = Math.max(0, p.buffs.luck - 1);
    if (p.buffs.xp > 0) p.buffs.xp = Math.max(0, p.buffs.xp - 1);
    if (p.buffs.horde > 0) p.buffs.horde = Math.max(0, p.buffs.horde - 1);
    if (p.buffs.atkBoost > 0) p.buffs.atkBoost = Math.max(0, p.buffs.atkBoost - 1);
    if (p.buffs.defBoost < 0) p.buffs.defBoost = Math.min(0, p.buffs.defBoost + 1);
    if (p.buffs.defBoost > 0) p.buffs.defBoost = Math.max(0, p.buffs.defBoost - 1);
    p.currentHp = playerHp;
    storage.saveBattlePlayer(guild.id, userId, p);
  }

  const finalP = storage.getBattlePlayer(guild.id, userId);
  const gemItem = finalP.gemXp ? ITEMS.find((i) => i.id === finalP.gemXp) : null;
  const embed = new EmbedBuilder()
    .setColor(lost ? COLORS.ERROR : COLORS.SUCCESS)
    .setTitle(`⚔️ Battle Results — ${wins}/${hordeCount} wins`)
    .setDescription(allLogs.join("\n"))
    .addFields(
      { name: "❤️ HP", value: `${finalP.currentHp}/${finalP.maxHp}`, inline: true },
      { name: "🔥 Streak", value: `${finalP.streak}`, inline: true },
    );

  if (gemItem) {
    embed.addFields({ name: `${gemItem.emoji} Active Gem`, value: `${gemItem.name} (**${getGemMultiplier(finalP.gemXp)}x XP**)`, inline: false });
  }

  if (finalP.buffs.luck > 0 || finalP.buffs.xp > 0 || finalP.buffs.horde > 0 || finalP.buffs.atkBoost > 0 || finalP.buffs.defBoost !== 0) {
    const active: string[] = [];
    if (finalP.buffs.luck > 0) active.push(`🍀 Luck (${finalP.buffs.luck} battles)`);
    if (finalP.buffs.xp > 0) active.push(`📈 XP (${finalP.buffs.xp} battles)`);
    if (finalP.buffs.horde > 0) active.push(`👾 Horde (${finalP.buffs.horde} battles)`);
    if (finalP.buffs.atkBoost > 0) active.push(`⚡ Atk+ (${finalP.buffs.atkBoost} battles)`);
    if (finalP.buffs.defBoost !== 0) active.push(`🛡️ Def${finalP.buffs.defBoost > 0 ? "+" : ""}${finalP.buffs.defBoost}`);
    embed.addFields({ name: "✨ Active Buffs", value: active.join("\n"), inline: false });
  }

  await interaction.reply({ embeds: [embed] });
}
