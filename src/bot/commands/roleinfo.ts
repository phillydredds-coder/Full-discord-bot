import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const name = "roleinfo";
export const aliases = ["rinfo", "role-info"];
export const usage = "roleinfo <@role>";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const targetRole = message.mentions.roles.first() || guild.roles.cache.get(args[0]);

  if (!targetRole) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Please mention or provide a role ID. Usage: `,roleinfo <@role>`");
    await message.reply({ embeds: [embed] });
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

  await message.reply({ embeds: [embed] });
}
