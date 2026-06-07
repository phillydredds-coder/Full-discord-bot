import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, openChest, getGemMultiplier, RARITY_ORDER, formatRarity, rarityColor } from "../battle-data.js";

export const data = new SlashCommandBuilder()
  .setName("use")
  .setDescription("Use a battle item")
  .addStringOption((o) => o.setName("item").setDescription("Item name or ID").setRequired(true).setAutocomplete(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const query = interaction.options.getString("item", true).toLowerCase();
  const item = ITEMS.find((i) => i.name.toLowerCase().includes(query) || i.id.includes(query));
  if (!item) {
    await interaction.reply({ content: "❌ Unknown item.", ephemeral: true });
    return;
  }

  let p = storage.getBattlePlayer(guild.id, interaction.user.id);
  const count = p.inventory[item.id] ?? 0;
  if (count < 1) {
    await interaction.reply({ content: `❌ You don't have any ${item.name}.`, ephemeral: true });
    return;
  }

  if (item.type === "potion") {
    if (item.id === "philosopher_stone") {
      p.maxHp += 20;
      p.currentHp = p.maxHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`**+20 permanent max HP!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (item.id === "elixir_immortal") {
      p.maxHp += 50;
      p.currentHp = p.maxHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`**+50 temp HP for 1 battle!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (item.id === "primordial_essence") {
      p.maxHp += 5;
      p.currentHp = p.maxHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`**+5 permanent max HP!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (item.id === "timeless_elixir") {
      p.currentHp = p.maxHp;
      p.buffs.luck += 3;
      p.buffs.xp += 3;
      p.buffs.horde = 1;
      p.buffs.atkBoost += 20;
      p.buffs.defBoost += 10;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`❤️ Fully restored + **all buffs extended by 3!**`)] });
      return;
    }
    if (item.id === "divine_potion") {
      const tempHp = 50;
      p.currentHp = p.maxHp + tempHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`❤️ Fully restored + **${tempHp} temp HP!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (item.id === "eternal_elixir") {
      p.maxHp += 10;
      p.currentHp = p.maxHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`**+10 permanent max HP!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (item.id === "cosmic_renewal") {
      p.currentHp = p.maxHp;
      p.buffs.luck += 3;
      p.buffs.xp += 3;
      p.buffs.atkBoost += 20;
      p.buffs.defBoost += 10;
      p.buffs.horde = 1;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`❤️ Fully restored + **all buffs +3!**`)] });
      return;
    }
    if (item.id === "absolute_essence") {
      p.maxHp += 25;
      p.baseAtk += 1;
      p.baseDef += 1;
      p.currentHp = p.maxHp;
      p.inventory[item.id]--;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(rarityColor(item.rarity)).setTitle(`${item.emoji} ${item.name}`).setDescription(`**+25 max HP, +1 Atk, +1 Def permanently!** ❤️ ${p.currentHp}/${p.maxHp}`)] });
      return;
    }
    if (p.currentHp >= p.maxHp) {
      await interaction.reply({ content: "❤️ Your HP is already full!", ephemeral: true });
      return;
    }
    const heal = item.effect! >= 9999 ? p.maxHp - p.currentHp : Math.min(item.effect!, p.maxHp - p.currentHp);
    p.currentHp += heal;
    p.inventory[item.id]--;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${item.emoji} Used ${item.name}`)
      .setDescription(`Restored **${heal}** HP! ❤️ ${p.currentHp}/${p.maxHp}`);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (item.type === "buff") {
    p.inventory[item.id]--;

    if (item.id === "luck_potion") {
      p.buffs.luck = item.effect!;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("🍀 Luck Potion").setDescription(`Activated! **3x drop rate** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "xp_potion") {
      p.buffs.xp = item.effect!;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("📈 XP Potion").setDescription(`Activated! **3x XP** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "horde_potion") {
      p.buffs.horde = 1;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("👾 Horde Potion").setDescription(`Activated! Your **next battle** will spawn **3 enemies** at once!`)] });
      return;
    }
    if (item.id === "elixir_power") {
      p.buffs.atkBoost = 20;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("⚡ Elixir of Power").setDescription(`Activated! **+20 Attack** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "berserker_potion") {
      p.buffs.atkBoost = 35;
      p.buffs.defBoost = -10;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle("🍺 Berserker Brew").setDescription(`Activated! **+35 Attack** but **-10 Defense** for the next **${item.effect}** battles! RAGEE!`)] });
      return;
    }
    if (item.id === "divine_blessing") {
      p.buffs.luck = item.effect!;
      p.buffs.xp = item.effect!;
      p.buffs.horde = 1;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("✨ Divine Blessing").setDescription(`Activated! **All buffs active** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "fortitude_potion") {
      p.buffs.defBoost = 15;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("🛡️ Fortitude Potion").setDescription(`Activated! **+15 Defense** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "rage_potion") {
      p.buffs.atkBoost = 50;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4444).setTitle("❤️‍🔥 Rage Potion").setDescription(`Activated! **+50 Attack** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "guardian_elixir") {
      p.buffs.defBoost = 30;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("🏰 Guardian Elixir").setDescription(`Activated! **+30 Defense** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "overdrive_potion") {
      p.buffs.atkBoost = 100;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff8800).setTitle("⚡ Overdrive Potion").setDescription(`Activated! **+100 Attack** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "sharpshooter_potion") {
      p.buffs.atkBoost = 10;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x44aaff).setTitle("🎯 Sharpshooter Potion").setDescription(`Activated! **+10 Attack** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "barrier_potion") {
      p.buffs.defBoost = 10;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x44aaff).setTitle("🛡️ Barrier Potion").setDescription(`Activated! **+10 Defense** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "frenzy_potion") {
      p.buffs.atkBoost = 40;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff6600).setTitle("💢 Frenzy Potion").setDescription(`Activated! **+40 Attack** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "bulwark_potion") {
      p.buffs.defBoost = 20;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x44cc44).setTitle("🏰 Bulwark Potion").setDescription(`Activated! **+20 Defense** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "titan_potion") {
      p.buffs.atkBoost = 40;
      p.buffs.defBoost = 20;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffaa00).setTitle("🗿 Titan Potion").setDescription(`Activated! **+40 Attack & +20 Defense** for the next **${item.effect}** battles!`)] });
      return;
    }
    if (item.id === "godmode_potion") {
      p.buffs.atkBoost = 200;
      p.buffs.defBoost = 100;
      storage.saveBattlePlayer(guild.id, interaction.user.id, p);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffdd00).setTitle("✨ Godmode Potion").setDescription(`Activated! **+200 Attack & +100 Defense** for **${item.effect}** battle!`)] });
      return;
    }
  }

  if (item.type === "weapon" || item.type === "armor") {
    const slot = item.type === "weapon" ? "weapon" : "armor";
    const current = p[slot];
    const oldItem = current ? ITEMS.find((i) => i.id === current) : null;
    p[slot] = item.id;
    p.inventory[item.id]--;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${item.emoji} Equipped ${item.name}`)
      .setDescription(oldItem ? `Replaced ${oldItem.emoji} **${oldItem.name}**.` : `**${item.description}** slotted!`);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (item.type === "chest") {
    let reward: ReturnType<typeof openChest> = null;

    if (item.id === "reinforced_chest") {
      const pool = ITEMS.filter((i) => (i.type === "weapon" || i.type === "armor") && RARITY_ORDER.indexOf(i.rarity) >= RARITY_ORDER.indexOf("rare"));
      if (pool.length > 0) reward = pool[Math.floor(Math.random() * pool.length)];
    } else if (item.id === "celestial_chest") {
      const pool = ITEMS.filter((i) => RARITY_ORDER.indexOf(i.rarity) >= RARITY_ORDER.indexOf("legendary"));
      if (pool.length > 0) reward = pool[Math.floor(Math.random() * pool.length)];
    } else if (item.id === "void_chest") {
      const pool = ITEMS.filter((i) => RARITY_ORDER.indexOf(i.rarity) >= RARITY_ORDER.indexOf("mythical"));
      if (pool.length > 0) reward = pool[Math.floor(Math.random() * pool.length)];
    } else {
      reward = openChest(item.rarity);
    }

    if (!reward) {
      await interaction.reply({ content: "❌ No items found for that chest rarity.", ephemeral: true });
      return;
    }
    p.inventory[item.id]--;
    p.inventory[reward.id] = (p.inventory[reward.id] ?? 0) + 1;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${item.emoji} Opened ${item.name}`)
      .setDescription(`You found **${reward.emoji} ${reward.name}**! (${formatRarity(reward.rarity)})`);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (item.type === "gem") {
    p.gemXp = item.id;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);
    const mult = getGemMultiplier(item.id);
    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${item.emoji} Equipped ${item.name}`)
      .setDescription(`**${mult}x XP multiplier** activated! All future XP gains are multiplied by **${mult}**!`);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  await interaction.reply({ content: "❌ That item can't be used this way.", ephemeral: true });
}

export async function autocomplete(interaction: any) {
  const focused = interaction.options.getFocused().toLowerCase();
  const filtered = ITEMS.filter((i) => i.name.toLowerCase().includes(focused) || i.id.includes(focused)).slice(0, 25);
  await interaction.respond(filtered.map((i: any) => ({ name: `${i.emoji} ${i.name}`, value: i.id })));
}
