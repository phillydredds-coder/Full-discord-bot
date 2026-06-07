import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, getGemMultiplier, getEnemyForLevel, getRandomDrop, formatRarity } from "../battle-data.js";
import type { Enemy } from "../battle-data.js";

export const name = "huntadmin";
export const aliases = ["ha", "huntpanel", "hp-admin"];
export const usage = "huntadmin <@user> <view|hp|atk|def|weapon|armor|gem|chain|give> [value]  |  huntadmin share <@user>  |  huntadmin unshare <@user>  |  huntadmin list";

export async function execute(message: Message, args: string[]) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    await message.reply("❌ BOT_CREATOR_ID is not configured.");
    return;
  }

  const guild = message.guild;
  if (!guild) return;

  const authorized = storage.getHuntadminAuth(guild.id);
  const isOwner = message.author.id === BOT_CREATOR;
  const isAuthorized = isOwner || authorized.includes(message.author.id);

  if (!isOwner && !isAuthorized) {
    await message.reply("❌ Only the bot creator or authorized users can use this command.");
    return;
  }

  const subcmd = args[0]?.toLowerCase();

  // ── share (owner only) ──
  if (subcmd === "share") {
    if (!isOwner) {
      await message.reply("❌ Only the bot creator can authorize other users.");
      return;
    }
    const target = message.mentions.users.first();
    if (!target) {
      await message.reply("❌ Mention a user to share access with.");
      return;
    }
    storage.setHuntadminAuth(guild.id, target.id, true);
    await message.reply(`✅ Shared huntadmin access with **${target.tag}**.`);
    return;
  }

  // ── unshare (owner only) ──
  if (subcmd === "unshare") {
    if (!isOwner) {
      await message.reply("❌ Only the bot creator can revoke authorization.");
      return;
    }
    const target = message.mentions.users.first() || (args[1] ? await message.client.users.fetch(args[1]).catch(() => null) : null);
    if (!target) {
      await message.reply("❌ Mention a user or provide their ID.");
      return;
    }
    storage.setHuntadminAuth(guild.id, target.id, false);
    await message.reply(`✅ Revoked huntadmin access from **${target.tag}**.`);
    return;
  }

  // ── list ──
  if (subcmd === "list") {
    const authList = storage.getHuntadminAuth(guild.id);
    if (authList.length === 0) {
      await message.reply("No authorized users (besides the bot creator).");
      return;
    }
    const lines = authList.map((id) => `<@${id}>`).join("\n");
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle("🔑 Authorized Users").setDescription(lines)] });
    return;
  }

  // ── stat commands require a target user ──
  const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
  if (!target) {
    await message.reply(
      `Usage:\n` +
      `  \`huntadmin <@user> <view|hp|atk|def|weapon|armor|gem|chain|give> [value]\`\n` +
      `  \`huntadmin share <@user>\` — Share access (owner only)\n` +
      `  \`huntadmin unshare <@user>\` — Revoke access (owner only)\n` +
      `  \`huntadmin list\` — Show authorized users`
    );
    return;
  }

  const stat = args[1]?.toLowerCase();
  const value = args.slice(2).join(" ");

  if (!stat) {
    await message.reply(`Specify a stat: \`view\`, \`hp\`, \`atk\`, \`def\`, \`weapon\`, \`armor\`, \`gem\`, \`chain\`, \`give\``);
    return;
  }

  if (stat === "view") {
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
    await message.reply({ embeds: [embed] });
    return;
  }

  if (stat === "hp") {
    const hp = parseInt(value, 10);
    if (isNaN(hp) || hp < 1) {
      await message.reply("❌ Provide a valid HP number (minimum 1).");
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.maxHp = hp;
    p.currentHp = hp;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Set ${target}'s HP to **${hp}**.`);
    return;
  }

  if (stat === "atk" || stat === "attack" || stat === "dmg") {
    const atk = parseInt(value, 10);
    if (isNaN(atk) || atk < 0) {
      await message.reply("❌ Provide a valid attack number (0+).");
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.baseAtk = atk;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Set ${target}'s base attack to **${atk}**.`);
    return;
  }

  if (stat === "def" || stat === "defense") {
    const def = parseInt(value, 10);
    if (isNaN(def) || def < 0) {
      await message.reply("❌ Provide a valid defense number (0+).");
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.baseDef = def;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Set ${target}'s base defense to **${def}**.`);
    return;
  }

  if (stat === "weapon") {
    const item = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!item || item.type !== "weapon") {
      await message.reply(`❌ Unknown weapon. Use an item ID like \`iron_sword\`, \`frost_blade\`, \`shadow_blade\`, etc.`);
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.weapon = item.id;
    if (!p.inventory[item.id]) p.inventory[item.id] = 1;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Equipped ${item.emoji} **${item.name}** (+${item.effect} Atk) on ${target}.`);
    return;
  }

  if (stat === "armor") {
    const item = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!item || item.type !== "armor") {
      await message.reply(`❌ Unknown armor. Use an item ID like \`cloth_robe\`, \`plate_armor\`, \`void_armor\`, etc.`);
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.armor = item.id;
    if (!p.inventory[item.id]) p.inventory[item.id] = 1;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Equipped ${item.emoji} **${item.name}** (+${item.effect} Def) on ${target}.`);
    return;
  }

  if (stat === "give" || stat === "add" || stat === "item") {
    const parts = value.split(/\s+/);
    const count = parseInt(parts[parts.length - 1], 10);
    const amount = !isNaN(count) && count > 0 ? count : 1;
    const query = !isNaN(count) ? parts.slice(0, -1).join(" ") : value;

    const item = ITEMS.find((i) => i.id === query || i.name.toLowerCase() === query.toLowerCase());
    if (!item) {
      await message.reply(`❌ Unknown item. Use an item ID like \`hp_potion\`, \`iron_sword\`, \`luck_potion\`, etc.`);
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.inventory[item.id] = (p.inventory[item.id] ?? 0) + amount;
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Gave ${item.emoji} **${item.name}** x${amount} to ${target}.`);
    return;
  }

  if (stat === "gem") {
    const gem = ITEMS.find((i) => i.id === value || i.name.toLowerCase() === value.toLowerCase());
    if (!gem || gem.type !== "gem") {
      await message.reply(`❌ Unknown gem. Use a gem ID like \`tiny_xp_gem\`, \`xp_gem\`, \`greater_xp_gem\`, etc.`);
      return;
    }
    const p = storage.getBattlePlayer(guild.id, target.id);
    p.gemXp = gem.id;
    const mult = getGemMultiplier(gem.id);
    storage.saveBattlePlayer(guild.id, target.id, p);
    await message.reply(`✅ Equipped ${gem.emoji} **${gem.name}** (**${mult}x XP**) on ${target}.`);
    return;
  }

  if (stat === "chain") {
    const count = parseInt(value, 10);
    if (isNaN(count) || count < 1) {
      await message.reply("❌ Provide a valid number of battles to fight (1+).");
      return;
    }
    if (count > 10000) {
      await message.reply("❌ Max 10,000 battles at once.");
      return;
    }

    const initial = await message.reply(`⚔️ Starting **${count}** battle${count !== 1 ? "s" : ""} for ${target}...`);

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

    await initial.edit({ content: null, embeds: [embed] });
    return;
  }

  await message.reply(`Unknown stat \`${stat}\`. Use: \`view\`, \`hp\`, \`atk\`, \`def\`, \`weapon\`, \`armor\`, \`gem\`, \`chain\`, \`give\``);
}
