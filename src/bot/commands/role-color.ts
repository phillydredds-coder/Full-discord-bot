import { Message, EmbedBuilder } from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

export const name = "role-color";
export const aliases = ["rc"];
export const usage = "role-color <#RRGGBB>";

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

  const colorInput = (args[0] ?? "").trim();
  if (!HEX_REGEX.test(colorInput)) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Invalid color. Please provide a valid HEX color. Usage: `,role-color #FFCFE6`");
    await message.reply({ embeds: [embed] });
    return;
  }

  const colorInt = parseInt(colorInput.slice(1), 16);

  try {
    await role.setColor(colorInt, `Color changed by owner ${message.author.tag}`);
    const embed = new EmbedBuilder()
      .setColor(colorInt)
      .setDescription(`✅ Your role color has been updated to **${colorInput}**.`);
    await message.reply({ embeds: [embed] });
  } catch {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Failed to update the role color. Check the bot's permissions.");
    await message.reply({ embeds: [embed] });
  }
}
