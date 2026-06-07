import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("modhelp")
  .setDescription("Show moderation and utility commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🛡️ Moderation & Utility Commands")
    .setDescription("Moderation commands require appropriate permissions.")
    .addFields(
      {
        name: "**Moderation**",
        value: [
          "/ban <user> [reason] — Ban a user. Requires Ban Members.",
          "/kick <user> [reason] — Kick a user. Requires Kick Members.",
          "/mute <user> <duration> — Timeout a user (e.g. 2d 3h 41m).",
          "/unmute <user> — Remove an active timeout.",
          "/reactionrole — Opens pronoun/gender/ping role menu. Requires Manage Roles.",
          "/sobboard [#channel] — Set or view the sob board channel.",
        ].join("\n"),
        inline: false,
      },
      {
        name: "**Info**",
        value: [
          "/serverinfo — Server stats, boost level, member count, channels.",
          "/roleinfo <role> — Role details (color, icon, permissions, member count).",
          "/inviteinfo <code> — Invite stats (channel, uses, created by, expiration).",
        ].join("\n"),
        inline: false,
      },
      {
        name: "**Server Tools**",
        value: [
          "/server-copier <invite> — Join and copy all channels/categories from a server. Requires Manage Server.",
          "/updatelog — View the bot's changelog.",
          "/addupdate <version> <date> <changes> — Add a changelog entry. Requires Manage Server.",
          "/advertise — DM your server invite to all mutual-server users. Requires Manage Server.",
          "/restart — Restart the bot. Bot-creator only.",
        ].join("\n"),
        inline: false,
      },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
