import { Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { COLORS } from "../constants.js";

export const name = "kick";
export const aliases = ["k"];
export const usage = "kick <@user> [reason]";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  // Check bot permissions
  if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.KickMembers)) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ I don't have permission to kick members.");
    await message.reply({ embeds: [embed] });
    return;
  }

  // Check user permissions
  if (!(message.member?.permissions.has(PermissionFlagsBits.KickMembers))) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You don't have permission to kick members.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const target = message.mentions.members?.first();
  if (!target) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Please mention a user to kick. Usage: `,kick <@user> [reason]`");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (target.id === message.author.id) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You can't kick yourself.");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (target.id === guild.ownerId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You can't kick the server owner.");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (
    message.member instanceof require("discord.js").GuildMember &&
    target.roles.highest.position >= message.member.roles.highest.position &&
    message.author.id !== guild.ownerId
  ) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You can't kick someone with a higher or equal role.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    await target.kick(`Kicked by ${message.author.tag}: ${reason}`);

    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle("✅ User Kicked")
      .addFields(
        { name: "User", value: target.user.tag, inline: true },
        { name: "Reason", value: reason, inline: true }
      );

    await message.reply({ embeds: [embed] });
  } catch (error) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Failed to kick the user. Check my permissions.");
    await message.reply({ embeds: [embed] });
  }
}
