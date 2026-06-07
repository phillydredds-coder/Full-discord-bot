import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("promoview")
  .setDescription("Preview how many users can be reached via /advertise");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const HOME_GUILD_ID = "1508675242208268530";

  await interaction.reply("🔄 Counting reachable users...");

  const uniqueUsers = new Map<string, string>();
  for (const g of interaction.client.guilds.cache.values()) {
    if (g.id === guild.id) continue;
    try {
      await g.members.fetch();
      for (const [, member] of g.members.cache) {
        if (!member.user.bot && !uniqueUsers.has(member.id)) {
          uniqueUsers.set(member.id, member.user.tag);
        }
      }
    } catch {}
  }

  const homeGuild = interaction.client.guilds.cache.get(HOME_GUILD_ID);
  if (homeGuild) {
    const toRemove: string[] = [];
    for (const userId of uniqueUsers.keys()) {
      if (homeGuild.members.cache.has(userId)) toRemove.push(userId);
    }
    for (const userId of toRemove) uniqueUsers.delete(userId);
  }

  const total = uniqueUsers.size;
  const otherServers = interaction.client.guilds.cache.size - 1;

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("📊 Advertise Preview")
    .setDescription(
      `**${total}** user${total !== 1 ? "s" : ""} across **${otherServers}** other server${otherServers !== 1 ? "s" : ""} can be reached.\n\n` +
      `Run \`/advertise\` to send them an invite to **${guild.name}**.`
    );

  await interaction.editReply({ content: null, embeds: [embed] });
}
