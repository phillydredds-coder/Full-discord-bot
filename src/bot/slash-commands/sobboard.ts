import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType } from "discord.js";
import { getStarboardConfig, setStarboardChannel, setStarboardEnabled } from "../storage.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("sobboard")
  .setDescription("Configure or toggle the sob board")
  .addChannelOption((opt) =>
    opt
      .setName("channel")
      .setDescription("The channel to send sob board messages to")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const requester = interaction.member;
  if (!(requester && (requester as any).permissions?.has(PermissionFlagsBits.ManageGuild))) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You need the **Manage Server** permission to configure the sob board.")], ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel");
  if (channel) {
    setStarboardChannel(guild.id, channel.id);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("😭 Sob Board Enabled").setDescription(`Sob board has been enabled and set to ${channel.toString()}.`).setFooter({ text: "Run /sobboard again to toggle it off." })] });
    return;
  }

  const config = getStarboardConfig(guild.id);
  if (!config.channelId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setTitle("😭 Sob Board — Not Configured").setDescription("No channel is set yet. Use /sobboard channel:#channel to set one and enable it.")], ephemeral: true });
    return;
  }

  const nowEnabled = !config.enabled;
  setStarboardEnabled(guild.id, nowEnabled);

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(nowEnabled ? COLORS.SUCCESS : COLORS.ERROR).setTitle(nowEnabled ? "😭 Sob Board Enabled" : "😭 Sob Board Disabled").setDescription(nowEnabled ? `Sob board is now **on** — messages reacted with 😭 will be forwarded to <#${config.channelId}>.` : "Sob board is now **off**. No messages will be forwarded.") ] });
}
