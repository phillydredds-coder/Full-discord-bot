import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("Remove a user's timeout")
  .addUserOption((opt) => opt.setName("user").setDescription("User to unmute").setRequired(true));

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
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't unmute yourself.")], ephemeral: true });
    return;
  }

  if (user.id === guild.ownerId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't unmute the server owner.")], ephemeral: true });
    return;
  }

  if (interaction.member instanceof Object && "roles" in interaction.member && (interaction.member as any).roles.highest.position <= member.roles.highest.position && interaction.user.id !== guild.ownerId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't unmute someone with a higher or equal role.")], ephemeral: true });
    return;
  }

  if (guild.members.me && member.roles.highest.position >= guild.members.me.roles.highest.position) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I can't unmute that user because their role is higher than mine.")], ephemeral: true });
    return;
  }

  try {
    await member.timeout(null, `Unmuted by ${interaction.user.tag}`);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("✅ User Unmuted").addFields(
      { name: "User", value: user.tag, inline: true },
      { name: "Action", value: "Unmuted", inline: true }
    )] });
  } catch (error) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to unmute the user. Make sure I have Moderate Members permission and the user's role is below mine.")], ephemeral: true });
  }
}
