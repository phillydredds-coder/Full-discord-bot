import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("View your battle stats and equipment");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const p = storage.getBattlePlayer(guild.id, interaction.user.id);
  const weapon = p.weapon ? (await import("../battle-data.js")).ITEMS.find((i: any) => i.id === p.weapon) : null;
  const armor = p.armor ? (await import("../battle-data.js")).ITEMS.find((i: any) => i.id === p.armor) : null;
  const atk = p.baseAtk + (weapon?.effect ?? 0);
  const def = p.baseDef + (armor?.effect ?? 0);

  const xpNeeded = p.level * 50;
  const barLen = 15;
  const filled = Math.round((p.xp / xpNeeded) * barLen);
  const xpBar = "█".repeat(filled) + "░".repeat(Math.max(0, barLen - filled));
  const hpBarLen = 15;
  const hpFilled = Math.round((p.currentHp / p.maxHp) * hpBarLen);
  const hpBar = "█".repeat(Math.max(0, hpFilled)) + "░".repeat(Math.max(0, hpBarLen - hpFilled));

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle(`⚔️ ${interaction.user.username}'s Profile`)
    .setDescription(`Level **${p.level}** ⭐ | ${p.battles} battles • ${p.wins} wins`)
    .addFields(
      { name: "❤️ HP", value: `${p.currentHp}/${p.maxHp}\n\`${hpBar}\``, inline: false },
      { name: "⚔️ Attack", value: `${atk}${weapon ? ` *(+${weapon.effect})*` : ""}`, inline: true },
      { name: "🛡️ Defense", value: `${def}${armor ? ` *(+${armor.effect})*` : ""}`, inline: true },
      { name: "✨ XP", value: `${p.xp}/${xpNeeded}\n\`${xpBar}\``, inline: false },
      { name: "🔥 Streak", value: `${p.streak} wins in a row`, inline: true },
    );

  if (weapon) embed.addFields({ name: "🗡️ Weapon", value: `${weapon.emoji} ${weapon.name}`, inline: true });
  if (armor) embed.addFields({ name: "🛡️ Armor", value: `${armor.emoji} ${armor.name}`, inline: true });

  const gem = p.gemXp ? (await import("../battle-data.js")).ITEMS.find((i: any) => i.id === p.gemXp) : null;
  if (gem) {
    const mult = (await import("../battle-data.js")).getGemMultiplier(p.gemXp);
    embed.addFields({ name: `${gem.emoji} XP Gem`, value: `${gem.name} (**${mult}x**)`, inline: true });
  }

  await interaction.reply({ embeds: [embed] });
}
