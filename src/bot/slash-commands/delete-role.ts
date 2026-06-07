import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getOwnerRole, removeOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
.setName("deleterole")
  .setDescription("Delete your custom role");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, interaction.user.id);
  if (!roleId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't own a custom role.")], ephemeral: true });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  try {
    if (role) await role.delete(`Deleted by owner ${interaction.user.tag}`);
    removeOwnerRole(guild.id, interaction.user.id);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setDescription(`✅ Your custom role${role ? ` **${role.name}**` : ""} has been deleted.`),
      ],
    });
  } catch {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to delete the role. Check the bot's permissions.")], ephemeral: true });
  }
}
