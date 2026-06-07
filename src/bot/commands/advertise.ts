import { Message, EmbedBuilder, TextChannel } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "advertise";
export const aliases = ["ad", "promote"];
export const usage = "advertise";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const HOME_GUILD_ID = "1508675242208268530";

  const inviteCode = "bbydollz";

  const statusMsg = await message.reply("🔄 Gathering mutual server members...");

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
  if (total === 0) {
    await statusMsg.edit("❌ No members found in mutual servers to advertise to.");
    return;
  }

  await statusMsg.edit(
    `⚠️ This will DM **${total} users** across ${message.client.guilds.cache.size - 1} other servers with an invite to **${guild.name}**.\n\n` +
    `Reply with \`yes\` within 30 seconds to confirm.`
  );

  const collected = await (message.channel as TextChannel).awaitMessages({
    filter: (m: Message) => m.author.id === message.author.id && m.content.toLowerCase() === "yes",
    max: 1,
    time: 30_000,
  }).catch(() => null);

  if (!collected || collected.size === 0) {
    await statusMsg.edit("❌ Canceled.");
    return;
  }

  await statusMsg.edit(`🔄 Advertising to ${total} users...`);

  let sent = 0;
  let failed = 0;

  for (const [userId] of uniqueUsers) {
    try {
      const user = await message.client.users.fetch(userId);
      const embed = new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle(`🩷 Join ${guild.name}!`)
        .setDescription(
          `Hey! You've been invited to check out **${guild.name}** — a cute and cozy community! 🎀\n\n` +
          `✨ Cute role management & customization\n` +
          `🛍️ Economy system with purchasable tiers\n` +
          `🎵 Voice channels, streaming & more\n` +
          `🩷 Aesthetic pastel vibes all around\n\n` +
          `Click the link below to join!`
        )
        .setThumbnail(guild.iconURL({ size: 256 }))
        .setFooter({ text: `Sent from ${guild.name}` });

      await user.send({ embeds: [embed], content: `https://discord.gg/${inviteCode}` });
      sent++;
    } catch {
      failed++;
    }

    if ((sent + failed) % 10 === 0 || sent + failed === total) {
      await statusMsg.edit(`🔄 Advertising... **${sent}** sent, **${failed}** failed (${sent + failed}/${total})`);
    }
  }

  await statusMsg.edit(`✅ Done! Advertised **${guild.name}** to **${sent}** users (${failed} couldn't be reached).`);
}
