import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("inviteinfo")
  .setDescription("Show information about an invite")
  .addStringOption((opt) => opt.setName("code").setDescription("Invite code or URL").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const codeRaw = interaction.options.getString("code", true);
  try {
    const inviteCode = codeRaw.replace(/https:\/\/discord\.gg\//, "").split("/").pop() || codeRaw;
    const invite = await interaction.client.fetchInvite(inviteCode);

    if (!invite.guild) {
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ This invite doesn't lead to a server.")], ephemeral: true });
      return;
    }

    const maxUses = invite.maxUses || "Unlimited";
    const uses = invite.uses || 0;
    const temporary = invite.temporary ? "✅ Yes" : "❌ No";
    const inviter = invite.inviter ? invite.inviter.tag : "Unknown";

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`🔗 Invite Information`)
      .setThumbnail(invite.guild.iconURL({ size: 512 }))
      .addFields(
        { name: "Server", value: invite.guild.name, inline: true },
        { name: "Server ID", value: invite.guild.id, inline: true },
        { name: "Inviter", value: inviter, inline: true },
        { name: "Channel", value: invite.channel?.name || "Unknown", inline: true },
        { name: "Uses", value: `${uses}/${maxUses}`, inline: true },
        { name: "Temporary", value: temporary, inline: true },
        {
          name: "Created",
          value: invite.createdTimestamp ? `<t:${Math.floor(invite.createdTimestamp / 1000)}:f>` : "Unknown",
          inline: false,
        }
      );

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Invalid invite code or the invite has expired.")], ephemeral: true });
  }
}
