import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "unmute";
export const aliases = ["um"];
export const usage = "unmute <@user>";

function extractMention(message: Message) {
  const content = message.content.trim();
  const withoutPrefix = content.startsWith(PREFIX)
    ? content.slice(PREFIX.length).trim()
    : content;

  const mentionMatch = withoutPrefix.match(/<@!?(\d+)>/);
  return mentionMatch?.[0] ?? null;
}

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ I don't have permission to timeout members."),
      ],
    });
    return;
  }

  if (!(message.member?.permissions.has(PermissionFlagsBits.ModerateMembers))) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You don't have permission to timeout members."),
      ],
    });
    return;
  }

  const mentionText = extractMention(message);
  const target = message.mentions.members?.first() ??
    (mentionText ? await guild.members.fetch(mentionText.replace(/<@!?(\d+)>/, "$1")).catch(() => null) : null);

  if (!target) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ Please mention a user to unmute. Usage: `,unmute <@user>`"),
      ],
    });
    return;
  }

  if (target.id === message.author.id) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You can't unmute yourself."),
      ],
    });
    return;
  }

  if (target.id === guild.ownerId) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You can't unmute the server owner."),
      ],
    });
    return;
  }

  if (
    message.member instanceof require("discord.js").GuildMember &&
    target.roles.highest.position >= message.member.roles.highest.position &&
    message.author.id !== guild.ownerId
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You can't unmute someone with a higher or equal role."),
      ],
    });
    return;
  }

  if (
    guild.members.me &&
    target.roles.highest.position >= guild.members.me.roles.highest.position
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ I can't unmute that user because their role is higher than mine."),
      ],
    });
    return;
  }

  try {
    await target.timeout(null, `Unmuted by ${message.author.tag}`);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setTitle("✅ User Unmuted")
          .addFields(
            { name: "User", value: target.user.tag, inline: true },
            { name: "Action", value: "Unmuted", inline: true }
          ),
      ],
    });
  } catch (error) {
    console.error("unmute command failed:", error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription(
            "❌ Failed to unmute the user. Make sure I have Moderate Members permission and the user's role is below mine."
          ),
      ],
    });
  }
}
