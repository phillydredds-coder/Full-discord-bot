import { Message, EmbedBuilder } from "discord.js";
import { getOwnerRole, removeOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const name = "delete-role";
export const aliases = ["dr"];
export const usage = "delete-role";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, message.author.id);
  if (!roleId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You don't own a custom role.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const role = guild.roles.cache.get(roleId);

  try {
    if (role) await role.delete(`Deleted by owner ${message.author.tag}`);
    removeOwnerRole(guild.id, message.author.id);

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setDescription(`✅ Your custom role${role ? ` **${role.name}**` : ""} has been deleted.`);
    await message.reply({ embeds: [embed] });
  } catch {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Failed to delete the role. Check the bot's permissions.");
    await message.reply({ embeds: [embed] });
  }
}
