import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

export const data = new SlashCommandBuilder()
  .setName("rolecolor")
  .setDescription("Change the color of your custom role")
  .addStringOption((opt) => opt.setName("color").setDescription("HEX color, e.g. #FFCFE6").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, interaction.user.id);
  if (!roleId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't own a custom role. Create one with /createrole.")], ephemeral: true });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Your custom role no longer exists. Use /createrole to make a new one.")], ephemeral: true });
    return;
  }

  const colorInput = interaction.options.getString("color", true).trim();
  if (!HEX_REGEX.test(colorInput)) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Invalid color. Please provide a valid HEX color. Usage: /rolecolor #FFCFE6")], ephemeral: true });
    return;
  }

  const colorInt = parseInt(colorInput.slice(1), 16);
  try {
    await role.setColor(colorInt, `Color changed by owner ${interaction.user.tag}`);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(colorInt).setDescription(`✅ Your role color has been updated to **${colorInput}**.`)] });
  } catch (error) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to update the role color. Check the bot's permissions.")], ephemeral: true });
  }
}
