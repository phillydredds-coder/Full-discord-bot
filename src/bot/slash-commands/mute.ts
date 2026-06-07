import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

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

    if (unit.startsWith("d")) totalMs += value * 24 * 60 * 60 * 1000;
    else if (unit.startsWith("h")) totalMs += value * 60 * 60 * 1000;
    else if (unit.startsWith("m")) totalMs += value * 60 * 1000;
    else if (unit.startsWith("s")) totalMs += value * 1000;
  }

  return matched ? totalMs : 0;
}

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Mute a user for a duration")
  .addUserOption((opt) => opt.setName("user").setDescription("User to mute").setRequired(true))
  .addStringOption((opt) => opt.setName("duration").setDescription("Duration, e.g. 2d 3h 41m").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I don't have permission to timeout members.")], ephemeral: true });
    return;
  }

  const requester = interaction.member;
  if (!(requester && (requester as any).permissions?.has(PermissionFlagsBits.ModerateMembers))) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't have permission to timeout members.")], ephemeral: true });
    return;
  }

  const user = interaction.options.getUser("user", true);
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ That user is not in this server.")], ephemeral: true });
    return;
  }

  if (user.id === interaction.user.id) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't mute yourself.")], ephemeral: true });
    return;
  }

  if (user.id === guild.ownerId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't mute the server owner.")], ephemeral: true });
    return;
  }

  if (interaction.member instanceof Object && "roles" in interaction.member && (interaction.member as any).roles.highest.position <= member.roles.highest.position && interaction.user.id !== guild.ownerId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't mute someone with a higher or equal role.")], ephemeral: true });
    return;
  }

  if (guild.members.me && member.roles.highest.position >= guild.members.me.roles.highest.position) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I can't mute that user because their role is higher than mine.")], ephemeral: true });
    return;
  }

  const duration = interaction.options.getString("duration", true).trim();
  const durationMs = parseDuration(duration);
  if (durationMs <= 0) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Please provide a valid duration. Example: 2d 3h 41m")], ephemeral: true });
    return;
  }

  if (durationMs > MAX_TIMEOUT_MS) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ The timeout duration cannot exceed 28 days.")], ephemeral: true });
    return;
  }

  try {
    await member.timeout(durationMs, `Muted by ${interaction.user.tag}`);
    const until = new Date(Date.now() + durationMs).toLocaleString();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("✅ User Muted").addFields(
      { name: "User", value: user.tag, inline: true },
      { name: "Duration", value: duration, inline: true },
      { name: "Expires", value: until, inline: true }
    )] });
  } catch (error) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to mute the user. Make sure I have Moderate Members permission and the user's role is below mine.")], ephemeral: true });
  }
}
