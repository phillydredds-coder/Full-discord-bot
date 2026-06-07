import { Message, EmbedBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { getStarboardConfig, setStarboardEnabled, setStarboardChannel } from "../storage.js";
import { COLORS } from "../constants.js";

export const name = "sobboard";
export const aliases = ["sb"];
export const usage = "sobboard | sobboard #channel";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild || !(message.member instanceof GuildMember)) return;

  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You need the **Manage Server** permission to configure the sob board.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const mentionedChannel = message.mentions.channels.first();

  // If a channel is mentioned, set it and enable
  if (mentionedChannel) {
    setStarboardChannel(guild.id, mentionedChannel.id);
    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle("😭 Sob Board Enabled")
      .setDescription(`Sob board has been enabled and set to ${mentionedChannel.toString()}.`)
      .setFooter({ text: "Run ,sobboard again to toggle it off." });
    await message.reply({ embeds: [embed] });
    return;
  }

  // Otherwise toggle on/off
  const config = getStarboardConfig(guild.id);

  if (!config.channelId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle("😭 Sob Board — Not Configured")
      .setDescription("No channel is set yet. Use `,sobboard #channel` to set one and enable it.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const nowEnabled = !config.enabled;
  setStarboardEnabled(guild.id, nowEnabled);

  const embed = new EmbedBuilder()
    .setColor(nowEnabled ? COLORS.SUCCESS : COLORS.ERROR)
    .setTitle(nowEnabled ? "😭 Sob Board Enabled" : "😭 Sob Board Disabled")
    .setDescription(
      nowEnabled
        ? `Sob board is now **on** — messages reacted with 😭 will be forwarded to <#${config.channelId}>.`
        : "Sob board is now **off**. No messages will be forwarded."
    );
  await message.reply({ embeds: [embed] });
}
