import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const name = "promoview";
export const aliases = ["pv", "adview"];
export const usage = "promoview";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const HOME_GUILD_ID = "1508675242208268530";

  const statusMsg = await message.reply("🔄 Counting reachable users...");

  const uniqueUsers = new Map<string, string>();
  for (const g of message.client.guilds.cache.values()) {
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

  // Exclude users already in the bbydollz server
  const homeGuild = message.client.guilds.cache.get(HOME_GUILD_ID);
  if (homeGuild) {
    const toRemove: string[] = [];
    for (const userId of uniqueUsers.keys()) {
      if (homeGuild.members.cache.has(userId)) toRemove.push(userId);
    }
    for (const userId of toRemove) uniqueUsers.delete(userId);
  }

  const total = uniqueUsers.size;
  const otherServers = message.client.guilds.cache.size - 1;

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("📊 Advertise Preview")
    .setDescription(
      `**${total}** user${total !== 1 ? "s" : ""} across **${otherServers}** other server${otherServers !== 1 ? "s" : ""} can be reached.\n\n` +
      `Run \`,ad\` to send them an invite to **${guild.name}**.`
    );

  await statusMsg.edit({ content: null, embeds: [embed] });
}
