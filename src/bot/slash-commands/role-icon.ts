import { ChatInputCommandInteraction, EmbedBuilder, GuildEmoji, SlashCommandBuilder } from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

function parseServerEmoji(input: string, emojis: Map<string, GuildEmoji>) {
  const customMatch = input.match(/^<a?:([\w]+):(\d+)>$/);
  if (customMatch) {
    const byId = emojis.get(customMatch[2]);
    if (byId) return byId;
    return [...emojis.values()].find((e) => e.name === customMatch[1]) ?? null;
  }
  const nameMatch = input.match(/^:?(?:([\w]+)):??$/);
  if (nameMatch) return [...emojis.values()].find((e) => e.name === nameMatch[1]) ?? null;
  return null;
}

export const data = new SlashCommandBuilder()
  .setName("roleicon")
  .setDescription("Set an emoji icon for your custom role")
  .addStringOption((opt) => opt.setName("emoji").setDescription("Server emoji to use as role icon").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const roleId = getOwnerRole(guild.id, interaction.user.id);
  if (!roleId) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You don't own a custom role. Create one with /createrole.")], ephemeral: true });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Your custom role no longer exists. Use /createrole to make a new one.")], ephemeral: true });
    return;
  }

  const emojiInput = interaction.options.getString("emoji", true).trim();
  const emoji = parseServerEmoji(emojiInput, guild.emojis.cache);
  if (!emoji) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Emoji not found in this server. Make sure to use a server emoji.")], ephemeral: true });
    return;
  }

  if (emoji.animated) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Animated emojis are not allowed as role icons.")], ephemeral: true });
    return;
  }

  try {
    const iconUrl = emoji.imageURL({ extension: "png", size: 64 });
    await role.setIcon(iconUrl, `Icon set by owner ${interaction.user.tag}`);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ Role icon has been set to ${emoji.toString()}.`)] });
  } catch (error) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to set the role icon. Role icons require **Server Boost Level 2** or higher, and the bot needs **Manage Roles** permission.")], ephemeral: true });
  }
}
