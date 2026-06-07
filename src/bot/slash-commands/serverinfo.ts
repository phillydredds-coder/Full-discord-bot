import { ChatInputCommandInteraction, EmbedBuilder, ChannelType, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder().setName("serverinfo").setDescription("Show information about the server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const owner = await guild.fetchOwner();
  const memberCount = guild.memberCount;
  const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
  const roles = guild.roles.cache.size;
  const emojis = guild.emojis.cache.size;
  const boosts = guild.premiumSubscriptionCount || 0;
  const boostLevel = guild.premiumTier || 0;

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`🏢 Server Information: ${guild.name}`)
    .setThumbnail(guild.iconURL({ size: 512 }))
    .addFields(
      { name: "Server ID", value: guild.id, inline: true },
      { name: "Owner", value: owner.user.tag, inline: true },
      { name: "Region", value: guild.preferredLocale || "Not specified", inline: true },
      { name: "Members", value: `${memberCount}`, inline: true },
      { name: "Roles", value: `${roles}`, inline: true },
      { name: "Text Channels", value: `${textChannels}`, inline: true },
      { name: "Voice Channels", value: `${voiceChannels}`, inline: true },
      { name: "Emojis", value: `${emojis}`, inline: true },
      { name: "Boost Level", value: `${boostLevel} (${boosts} boosts)`, inline: true },
      {
        name: "Created",
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`,
        inline: false,
      }
    );

  await interaction.reply({ embeds: [embed] });
}
