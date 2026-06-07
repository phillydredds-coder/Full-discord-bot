import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("roleinfo")
  .setDescription("Show information about a role")
  .addRoleOption((opt) => opt.setName("role").setDescription("Role to inspect").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const role = interaction.options.getRole("role", true);
  const targetRole = guild.roles.cache.get(role.id);
  if (!targetRole) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Role not found.")], ephemeral: true });
    return;
  }

  const memberCount = targetRole.members.size;
  const isHoisted = targetRole.hoist ? "✅ Yes" : "❌ No";
  const isMentionable = targetRole.mentionable ? "✅ Yes" : "❌ No";
  const isManaged = targetRole.managed ? "✅ Yes (Managed)" : "❌ No";

  const embed = new EmbedBuilder()
    .setColor(targetRole.color || COLORS.INFO)
    .setTitle(`📋 Role Information: ${targetRole.name}`)
    .addFields(
      { name: "Role ID", value: targetRole.id, inline: true },
      { name: "Position", value: `${targetRole.position}`, inline: true },
      { name: "Members", value: `${memberCount}`, inline: true },
      { name: "Color", value: targetRole.hexColor, inline: true },
      { name: "Hoisted", value: isHoisted, inline: true },
      { name: "Mentionable", value: isMentionable, inline: true },
      { name: "Managed", value: isManaged, inline: true },
      {
        name: "Created",
        value: `<t:${Math.floor(targetRole.createdTimestamp / 1000)}:f>`,
        inline: true,
      }
    );

  await interaction.reply({ embeds: [embed] });
}
