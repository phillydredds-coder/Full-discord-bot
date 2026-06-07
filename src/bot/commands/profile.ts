import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, getGemMultiplier } from "../battle-data.js";

export const name = "profile";
export const aliases = ["stats", "p"];
export const usage = "profile";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const p = storage.getBattlePlayer(guild.id, message.author.id);
  const weapon = p.weapon ? ITEMS.find((i) => i.id === p.weapon) : null;
  const armor = p.armor ? ITEMS.find((i) => i.id === p.armor) : null;
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
    .setTitle(`⚔️ ${message.author.username}'s Profile`)
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

  const gem = p.gemXp ? ITEMS.find((i) => i.id === p.gemXp) : null;
  if (gem) {
    embed.addFields({ name: `${gem.emoji} XP Gem`, value: `${gem.name} (**${getGemMultiplier(p.gemXp)}x**)`, inline: true });
  }

  await message.reply({ embeds: [embed] });
}
