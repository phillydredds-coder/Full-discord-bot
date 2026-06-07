import { Message, EmbedBuilder } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "mod-help";
export const aliases = ["mh"];
export const usage = "mod-help";

export async function execute(message: Message, _args: string[]) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🛡️ Moderation & Utility Commands")
    .setDescription(
      `Moderation commands require appropriate permissions. Utility commands have their own requirements.`
    )
    .addFields(
      {
        name: `**Moderation**`,
        value: [
          `\`${PREFIX}ban @user [reason]\` (\`${PREFIX}b\`) — Ban a user. Requires Ban Members.`,
          `\`${PREFIX}kick @user [reason]\` (\`${PREFIX}k\`) — Kick a user. Requires Kick Members.`,
          `\`${PREFIX}mute @user <duration>\` (\`${PREFIX}m\`) — Timeout a user (e.g. \`2d 3h 41m\`). Requires Moderate Members.`,
          `\`${PREFIX}unmute @user\` (\`${PREFIX}um\`) — Remove an active timeout.`,
          `\`${PREFIX}reaction-role\` (\`${PREFIX}rr\`) — Opens pronoun/gender/ping role menu. Requires Manage Roles.`,
          `\`${PREFIX}sobboard [#channel]\` (\`${PREFIX}sb\`) — Set or view the sob board channel.`,
          `\`${PREFIX}reaction-roles\` — Alias for reaction-role.`,
        ].join("\n"),
        inline: false,
      },
      {
        name: `**Info**`,
        value: [
          `\`${PREFIX}serverinfo\` (\`${PREFIX}si\`) — Server stats, boost level, member count, channels.`,
          `\`${PREFIX}roleinfo @role\` (\`${PREFIX}rinfo\`) — Role details (color, icon, permissions, member count).`,
          `\`${PREFIX}inviteinfo <code>\` (\`${PREFIX}ii\`) — Invite stats (channel, uses, created by, expiration).`,
        ].join("\n"),
        inline: false,
      },
      {
        name: `**Server Tools**`,
        value: [
          `\`${PREFIX}server-copier <invite>\` (\`${PREFIX}scopy\`) — Join a server via invite, copy all channels/categories, then leave. Requires Manage Server.`,
          `\`${PREFIX}updatelog\` (\`${PREFIX}uplog\`) — View the bot's changelog.`,
          `\`${PREFIX}addupdate <version> <date> <changes>\` (\`${PREFIX}newupdate\`) — Add a changelog entry. Requires Manage Server.`,
          `\`${PREFIX}advertise\` (\`${PREFIX}ad\`) — DM your server invite to all mutual-server users. Requires Manage Server.`,
        ].join("\n"),
        inline: false,
      },
      {
        name: `**Bot Owner**`,
        value: `\`${PREFIX}restart\` (\`${PREFIX}reboot\`) — Restart the bot. Bot-creator only.`,
        inline: false,
      },
    );

  await message.reply({ embeds: [embed] });
}
