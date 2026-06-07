import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "mute";
export const aliases = ["m"];
export const usage = "mute <@user> <duration>";

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

function parseDuration(duration: string) {
  const regex = /(\d+)\s*(d(?:ays?)?|h(?:ours?)?|m(?:in(?:utes?)?)?|s(?:ec(?:onds?)?)?)/gi;
  let totalMs = 0;
  let matched = false;

  for (const match of duration.matchAll(regex)) {
    matched = true;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (Number.isNaN(value) || value <= 0) continue;

    if (unit.startsWith("d")) {
      totalMs += value * 24 * 60 * 60 * 1000;
    } else if (unit.startsWith("h")) {
      totalMs += value * 60 * 60 * 1000;
    } else if (unit.startsWith("m")) {
      totalMs += value * 60 * 1000;
    } else if (unit.startsWith("s")) {
      totalMs += value * 1000;
    }
  }

  return matched ? totalMs : 0;
}

function extractDurationFromMessage(message: Message) {
  const content = message.content.trim();
  const withoutPrefix = content.startsWith(PREFIX)
    ? content.slice(PREFIX.length).trim()
    : content;

  const mentionMatch = withoutPrefix.match(/<@!?(\d+)>/);
  const commandRemoved = withoutPrefix.replace(/^(?:mute|m)\b/i, "").trim();
  if (!mentionMatch) {
    return commandRemoved;
  }

  return commandRemoved.replace(mentionMatch[0], "").trim();
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

  const mentionText = message.content.trim().match(/<@!?(\d+)>/)?.[0];
  const target =
    message.mentions.members?.first() ??
    (mentionText
      ? await guild.members.fetch(mentionText.replace(/<@!?(\d+)>/, "$1")).catch(() => null)
      : null);

  if (!target) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription(
            "❌ Please mention a user to mute. Usage: `,m @user 2d 3h 41m`"
          ),
      ],
    });
    return;
  }

  if (target.id === message.author.id) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You can't mute yourself."),
      ],
    });
    return;
  }

  if (target.id === guild.ownerId) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You can't mute the server owner."),
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
          .setDescription("❌ You can't mute someone with a higher or equal role."),
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
          .setDescription("❌ I can't mute that user because their role is higher than mine."),
      ],
    });
    return;
  }

  const durationArg = extractDurationFromMessage(message) || args.slice(1).join(" ").trim();
  const durationMs = parseDuration(durationArg);

  if (!durationArg || durationMs <= 0) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription(
            "❌ Please provide a valid duration. Example: `,m @user 2d 3h 41m`"
          ),
      ],
    });
    return;
  }

  if (durationMs > MAX_TIMEOUT_MS) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription(
            "❌ The timeout duration cannot exceed 28 days."
          ),
      ],
    });
    return;
  }

  try {
    await target.timeout(durationMs, `Muted by ${message.author.tag}`);

    const until = new Date(Date.now() + durationMs).toLocaleString();
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setTitle("✅ User Muted")
          .addFields(
            { name: "User", value: target.user.tag, inline: true },
            { name: "Duration", value: durationArg, inline: true },
            { name: "Expires", value: until, inline: true }
          ),
      ],
    });
  } catch (error) {
    console.error("mute command failed:", error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription(
            "❌ Failed to mute the user. Make sure I have Manage Roles / Moderate Members permission and the user's role is below mine."
          ),
      ],
    });
  }
}
