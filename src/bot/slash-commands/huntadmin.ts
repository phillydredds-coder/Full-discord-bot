import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, getGemMultiplier, getEnemyForLevel, getRandomDrop, formatRarity } from "../battle-data.js";
import type { Enemy } from "../battle-data.js";

export const data = new SlashCommandBuilder()
  .setName("huntadmin")
  .setDescription("[Bot Creator] Edit battle stats, chain battles, manage access")
  .addStringOption((o) => o.setName("action").setDescription("Action to perform").setRequired(true).addChoices(
    { name: "view", value: "view" },
    { name: "hp", value: "hp" },
    { name: "atk", value: "atk" },
    { name: "def", value: "def" },
    { name: "weapon", value: "weapon" },
    { name: "armor", value: "armor" },
    { name: "gem", value: "gem" },
    { name: "give", value: "give" },
    { name: "chain", value: "chain" },
    { name: "share", value: "share" },
    { name: "unshare", value: "unshare" },
    { name: "list", value: "list" },
  ))
  .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(false))
  .addStringOption((o) => o.setName("value").setDescription("Value (HP/atk/def number, item ID, chain count)").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    await interaction.reply({ content: "❌ BOT_CREATOR_ID is not configured.", ephemeral: true });
    return;
  }

  const guild = interaction.guild;
  if (!guild) return;

  const authorized = storage.getHuntadminAuth(guild.id);
  const isOwner = interaction.user.id === BOT_CREATOR;
  const isAuthorized = isOwner || authorized.includes(interaction.user.id);

  if (!isOwner && !isAuthorized) {
    await interaction.reply({ content: "❌ Only the bot creator or authorized users can use this command.", ephemeral: true });
    return;
  }

  const action = interaction.options.getString("action", true);
  const target = interaction.options.getUser("user");
  const value = interaction.options.getString("value") ?? "";

  // ── list ──
  if (action === "list") {
    const authList = storage.getHuntadminAuth(guild.id);
    if (authList.length === 0) {
      await interaction.reply("No authorized users (besides the bot creator).");
      return;
    }
    const lines = authList.map((id) => `<@${id}>`).join("\n");
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle("🔑 Authorized Users").setDescription(lines)] });
    return;
  }

  // ── share / unshare (owner only) ──
  if (action === "share" || action === "unshare") {
    if (!isOwner) {
      await interaction.reply({ content: "❌ Only the bot creator can manage authorization.", ephemeral: true });
      return;
    }
    if (!target) {
      await interaction.reply({ content: "❌ Specify a user.", ephemeral: true });
      return;
    }
    storage.setHuntadminAuth(guild.id, target.id, action === "share");
    await interaction.reply(`✅ ${action === "share" ? "Shared" : "Revoked"} huntadmin access ${action === "share" ? "with" : "from"} **${target.tag}**.`);
    return;
  }

  if (!target) {
    await interaction.reply({ content: "❌ Specify a target user for this action.", ephemeral: true });
    return;
  }

  // ── view ──
  if (action === "view") {
    const p = storage.getBattlePlayer(guild.id, target.id);
    const weaponItem = p.weapon ? ITEMS.find((i) => i.id === p.weapon) : null;
    const armorItem = p.armor ? ITEMS.find((i) => i.id === p.armor) : null;
    const gemItem = p.gemXp ? ITEMS.find((i) => i.id === p.gemXp) : null;
    const invList = Object.entries(p.inventory)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => {
        const item = ITEMS.find((i) => i.id === id);
        return `${item?.emoji ?? "❓"} ${item?.name ?? id} x${c}`;
      });

    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`⚔️ ${target.tag} — Battle Stats`)
      .addFields(
        { name: "❤️ HP", value: `${p.currentHp}/${p.maxHp}`, inline: true },
        { name: "⚔️ Atk", value: `${p.baseAtk}`, inline: true },
        { name: "🛡️ Def", value: `${p.baseDef}`, inline: true },
        { name: "🗡️ Weapon", value: weaponItem ? `${weaponItem.emoji} ${weaponItem.name} (+${weaponItem.effect} Atk)` : "None", inline: true },
        { name: "🛡️ Armor", value: armorItem ? `${armorItem.emoji} ${armorItem.name} (+${armorItem.effect} Def)` : "None", inline: true },
        { name: "💎 Gem", value: gemItem ? `${gemItem.emoji} ${gemItem.name} (**${getGemMultiplier(p.gemXp)}x XP**)` : "None", inline: true },
        { name: "📊 Level", value: `${p.level} (${p.xp} XP)`, inline: true },
        { name: "🔥 Streak", value: `${p.streak}`, inline: true },
        { name: "📦 Inventory", value: invList.length > 0 ? invList.join("\n") : "Empty", inline: false },
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── hp ──
  if (action === "hp") {
    const hp = parseInt(value, 10);
    if (isNaN(hp) || hp < 1) {
      await interaction.reply({ content: "❌ Provide a valid HP number (minimum 1).", ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.maxHp = hp;
    p.currentHp = hp;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Set ${target}'s HP to **${hp}**.`);
    return;
  }

  // ── atk ──
  if (action === "atk") {
    const atk = parseInt(value, 10);
    if (isNaN(atk) || atk < 0) {
      await interaction.reply({ content: "❌ Provide a valid attack number (0+).", ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.baseAtk = atk;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Set ${target}'s base attack to **${atk}**.`);
    return;
  }

  // ── def ──
  if (action === "def") {
    const def = parseInt(value, 10);
    if (isNaN(def) || def < 0) {
      await interaction.reply({ content: "❌ Provide a valid defense number (0+).", ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.baseDef = def;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Set ${target}'s base defense to **${def}**.`);
    return;
  }

  // ── weapon ──
  if (action === "weapon") {
    const item = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!item || item.type !== "weapon") {
      await interaction.reply({ content: `❌ Unknown weapon. Use an item ID like \`iron_sword\`, \`frost_blade\`, etc.`, ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.weapon = item.id;
    if (!p.inventory[item.id]) p.inventory[item.id] = 1;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Equipped ${item.emoji} **${item.name}** (+${item.effect} Atk) on ${target}.`);
    return;
  }

  // ── armor ──
  if (action === "armor") {
    const item = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!item || item.type !== "armor") {
      await interaction.reply({ content: `❌ Unknown armor. Use an item ID like \`cloth_robe\`, \`plate_armor\`, etc.`, ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.armor = item.id;
    if (!p.inventory[item.id]) p.inventory[item.id] = 1;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Equipped ${item.emoji} **${item.name}** (+${item.effect} Def) on ${target}.`);
    return;
  }

  // ── gem ──
  if (action === "gem") {
    const gem = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!gem || gem.type !== "gem") {
      await interaction.reply({ content: `❌ Unknown gem. Use a gem ID like \`tiny_xp_gem\`, \`xp_gem\`, etc.`, ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.gemXp = gem.id;
    const mult = getGemMultiplier(gem.id);
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Equipped ${gem.emoji} **${gem.name}** (**${mult}x XP**) on ${target}.`);
    return;
  }

  // ── give ──
  if (action === "give") {
    const parts = value.split(/\s+/);
    const count = parseInt(parts[parts.length - 1], 10);
    const amount = !isNaN(count) && count > 0 ? count : 1;
    const query = !isNaN(count) ? parts.slice(0, -1).join(" ") : value;

    const item = ITEMS.find((i) => i.id === query || i.name.toLowerCase() === query.toLowerCase());
    if (!item) {
      await interaction.reply({ content: `❌ Unknown item. Use an item ID like \`hp_potion\`, \`iron_sword\`, etc.`, ephemeral: true });
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.inventory[item.id] = (p.inventory[item.id] ?? 0) + amount;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await interaction.reply(`✅ Gave ${item.emoji} **${item.name}** x${amount} to ${target}.`);
    return;
  }

  // ── chain ──
  if (action === "chain") {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 1) {
      await interaction.reply({ content: "❌ Provide a valid number of battles to fight (1+).", ephemeral: true });
      return;
    }
    if (count > 10000) {
      await interaction.reply({ content: "❌ Max 10,000 battles at once.", ephemeral: true });
      return;
    }

    await interaction.reply(`⚔️ Starting **${count}** battle${count !== 1 ? "s" : ""} for ${target}...`);

    let p = storage.getBattlePlayer(guild.id, target.id);
    let totalXp = 0;
    let totalCoins = 0;
    let wins = 0;
    let losses = 0;
    let levelsGained = 0;
    const drops: string[] = [];

    for (let i = 0; i < count; i++) {
      p = storage.getBattlePlayer(guild.id, target.id);
      p.currentHp = p.maxHp;

      const weapon = p.weapon ? ITEMS.find((item) => item.id === p.weapon) : null;
      const armor = p.armor ? ITEMS.find((item) => item.id === p.armor) : null;
      const playerAtk = p.baseAtk + (weapon?.effect ?? 0) + (p.buffs.atkBoost || 0);
      const playerDef = p.baseDef + (armor?.effect ?? 0) + (p.buffs.defBoost || 0);

      const isBoss = Math.random() < 0.05 && p.level >= 5;
      const enemy = isBoss ? getEnemyForLevel(p.level, true) : getEnemyForLevel(p.level);
      const scaledEnemy: Enemy = {
        ...enemy,
        hp: Math.round((enemy.hp + p.level * 2) * (1 + p.streak * 0.12)),
        attack: Math.round((enemy.attack + Math.floor(p.level / 2)) * (1 + p.streak * 0.1)),
        defense: Math.round((enemy.defense + Math.floor(p.level / 3)) * (1 + p.streak * 0.1)),
      };

      let enemyHp = scaledEnemy.hp;
      let hp = p.currentHp;
      while (enemyHp > 0 && hp > 0) {
        const dmg = Math.max(1, playerAtk - scaledEnemy.defense + Math.floor(Math.random() * 7 - 2));
        enemyHp -= dmg;
        if (enemyHp <= 0) break;
        const enemyDmg = Math.max(1, Math.round((scaledEnemy.attack - playerDef * 0.5)) + Math.floor(Math.random() * 6 - 2));
        hp -= enemyDmg;
      }

      if (hp <= 0) {
        losses++;
        p.streak = 0;
        p.currentHp = 0;
        storage.saveBattlePlayer(guild.id, target.id, p);
        continue;
      }

      const streakMult = 1 + p.streak * 0.15;
      let xpGain = Math.round((scaledEnemy.xpReward + Math.floor(Math.random() * 11)) * streakMult);
      const coinGain = Math.round((scaledEnemy.coinReward + Math.floor(Math.random() * 6)) * streakMult);

      if (p.buffs.xp > 0) xpGain *= 3;
      const gemMult = getGemMultiplier(p.gemXp);
      if (gemMult > 1) xpGain = Math.round(xpGain * gemMult);

      p.xp += xpGain;
      storage.addBalance(guild.id, target.id, coinGain);
      p.battles++;
      p.wins++;
      p.streak++;
      p.currentHp = hp;
      totalXp += xpGain;
      totalCoins += coinGain;
      wins++;

      while (p.xp >= p.level * 50) {
        p.xp -= p.level * 50;
        p.level++;
        p.maxHp += 10;
        p.currentHp = p.maxHp;
        p.baseAtk += 2;
        p.baseDef += 1;
        levelsGained++;
        if (p.level % 5 === 0) {
          const itemPool = ITEMS.filter((i) => i.type !== "potion" && i.type !== "buff");
          const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
          p.inventory[randomItem.id] = (p.inventory[randomItem.id] ?? 0) + 1;
          drops.push(`🎁 Milestone: ${randomItem.emoji} ${randomItem.name}`);
        }
      }

      const dropRate = p.buffs.luck > 0 ? Math.min(1, scaledEnemy.dropRate * 3) : Math.min(0.9, scaledEnemy.dropRate * (1 + p.streak * 0.08));
      if (Math.random() < dropRate) {
        const drop = getRandomDrop(p.buffs.luck > 0 ? 3 : 1);
        if (drop) {
          p.inventory[drop.id] = (p.inventory[drop.id] ?? 0) + 1;
          drops.push(`${drop.emoji} ${drop.name} (${formatRarity(drop.rarity)})`);
        }
      }

      if (p.buffs.luck > 0) p.buffs.luck--;
      if (p.buffs.xp > 0) p.buffs.xp--;
      if (p.buffs.horde > 0) p.buffs.horde--;
      if (p.buffs.atkBoost > 0) p.buffs.atkBoost--;
      if (p.buffs.defBoost < 0) p.buffs.defBoost++;
      if (p.buffs.defBoost > 0) p.buffs.defBoost--;

      storage.saveBattlePlayer(guild.id, target.id, p);
    }

    const finalP = storage.getBattlePlayer(guild.id, target.id);
    const gemItem = finalP.gemXp ? ITEMS.find((i) => i.id === finalP.gemXp) : null;

    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`⚔️ Chain Battle Results — ${target.tag}`)
      .setDescription(
        `**${wins}** win${wins !== 1 ? "s" : ""} / **${wins + losses}** battle${wins + losses !== 1 ? "s" : ""}` +
        (losses > 0 ? ` (${losses} loss${losses !== 1 ? "es" : ""})` : "")
      )
      .addFields(
        { name: "⭐ XP Gained", value: `${totalXp.toLocaleString()}`, inline: true },
        { name: "💰 Coins Gained", value: `${totalCoins.toLocaleString()}`, inline: true },
        { name: "📈 Levels", value: `${levelsGained}`, inline: true },
        { name: "❤️ HP", value: `${finalP.currentHp}/${finalP.maxHp}`, inline: true },
        { name: "🔥 Streak", value: `${finalP.streak}`, inline: true },
        { name: "📊 Level", value: `${finalP.level}`, inline: true },
      );

    if (gemItem) {
      embed.addFields({ name: `${gemItem.emoji} Gem`, value: `${gemItem.name} (**${getGemMultiplier(finalP.gemXp)}x XP**)`, inline: false });
    }

    if (drops.length > 0) {
      const list = drops.slice(0, 10).join("\n");
      embed.addFields({ name: "🎁 Drops", value: list + (drops.length > 10 ? `\n...and ${drops.length - 10} more` : ""), inline: false });
    }

    await interaction.editReply({ content: null, embeds: [embed] });
    return;
  }
}
