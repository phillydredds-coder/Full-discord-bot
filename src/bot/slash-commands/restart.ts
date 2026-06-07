import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("restart")
  .setDescription("Restart the bot (bot creator only)")
  .setDefaultMemberPermissions(0);

export async function execute(interaction: ChatInputCommandInteraction) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    if (interaction.isRepliable()) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ BOT_CREATOR_ID is not configured on the process. Set this env var to restrict restart to the bot creator.")], ephemeral: true });
    }
    return;
  }

  if (interaction.user.id !== BOT_CREATOR) {
    if (interaction.isRepliable()) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Only the bot creator can restart me.")], ephemeral: true });
    }
    return;
  }

  if (interaction.isRepliable()) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.INFO).setDescription("🔄 Restarting... Goodbye.")], ephemeral: true });
  }
  // Allow the reply to be sent, then exit process
  setTimeout(() => process.exit(0), 1000);
}
