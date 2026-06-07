import { Message, EmbedBuilder } from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const name = "role-name";
export const aliases = ["rn"];
export const usage = "role-name <new name>";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, message.author.id);
  if (!roleId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You don't own a custom role. Create one with `,create-role <name>`.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Your custom role no longer exists. Use `,create-role` to make a new one.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const newName = args.join(" ").trim();
  if (!newName) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Please provide a new name. Usage: `,role-name <new name>`");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (newName.length > 100) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Role name must be 100 characters or fewer.");
    await message.reply({ embeds: [embed] });
    return;
  }

  try {
    await role.setName(newName, `Renamed by owner ${message.author.tag}`);
    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setDescription(`✅ Your role has been renamed to **${newName}**.`);
    await message.reply({ embeds: [embed] });
  } catch {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Failed to rename the role. Check the bot's permissions.");
    await message.reply({ embeds: [embed] });
  }
}
