import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a user from the server")
  .addUserOption((opt) => opt.setName("user").setDescription("User to kick").setRequired(true))
  .addStringOption((opt) => opt.setName("reason").setDescription("Reason for kick"));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const requester = interaction.member;

  if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.KickMembers)) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I don't have permission to kick members.")], ephemeral: true });
    return;
  }

  if (!(requester && (requester as any).permissions?.has(PermissionFlagsBits.KickMembers))) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't have permission to kick members.")], ephemeral: true });
    return;
  }

  const user = interaction.options.getUser("user", true);
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ That user is not a member of this server.")], ephemeral: true });
    return;
  }

  if (user.id === interaction.user.id) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't kick yourself.")], ephemeral: true });
    return;
  }

  if (user.id === guild.ownerId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't kick the server owner.")], ephemeral: true });
    return;
  }

  const reason = interaction.options.getString("reason") || "No reason provided";

  try {
    await member.kick(`Kicked by ${interaction.user.tag}: ${reason}`);
    const embed = new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("✅ User Kicked").addFields(
      { name: "User", value: user.tag, inline: true },
      { name: "Reason", value: reason, inline: true }
    );
    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to kick the user. Check my permissions.")], ephemeral: true });
  }
}
