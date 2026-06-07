import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("rolename")
  .setDescription("Rename your custom role")
  .addStringOption((opt) => opt.setName("name").setDescription("New role name").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, interaction.user.id);
  if (!roleId) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't own a custom role. Create one with /createrole.")],
      ephemeral: true,
    });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Your custom role no longer exists. Use /createrole to make a new one.")],
      ephemeral: true,
    });
    return;
  }

  const newName = interaction.options.getString("name", true).trim();
  if (newName.length > 100) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Role name must be 100 characters or fewer.")],
      ephemeral: true,
    });
    return;
  }

  try {
    await role.setName(newName, `Renamed by owner ${interaction.user.tag}`);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ Your role has been renamed to **${newName}**.`)] });
  } catch (error) {
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to rename the role. Check the bot's permissions.")],
      ephemeral: true,
    });
  }
}
