import { Message, EmbedBuilder, ChannelType, Events, Guild, TextChannel } from "discord.js";
import { Routes } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "server-copier";
export const aliases = ["scopy", "copy-server"];
export const usage = "server-copier <invite_link>";

function extractInviteCode(input: string): string | null {
  const match = input.match(
    /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|com\/invite)|discordapp\.com\/invite)\/([a-zA-Z0-9_-]+)/i
  ) ?? input.match(/^([a-zA-Z0-9_-]+)$/);
  return match?.[1] ?? null;
}

function waitForGuild(client: any, guildId: string, timeoutMs: number): Promise<Guild> {
  return new Promise((resolve, reject) => {
    const existing = client.guilds.cache.get(guildId);
    if (existing) return resolve(existing);

    const timer = setTimeout(() => reject(new Error("Timed out waiting for guild")), timeoutMs);

    const handler = (guild: Guild) => {
      if (guild.id === guildId) {
        clearTimeout(timer);
        client.off(Events.GuildCreate, handler);
        resolve(guild);
      }
    };
    client.on(Events.GuildCreate, handler);
  });
}

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  const member = message.member;
  if (!guild || !member) return;

  if (!member.permissions.has("ManageGuild")) {
    await message.reply("❌ You need **Manage Server** permission to use this.");
    return;
  }

  if (!args[0]) {
    await message.reply(`Usage: \`${PREFIX}server-copier <invite_link>\``);
    return;
  }

  const inviteCode = extractInviteCode(args[0]);
  if (!inviteCode) {
    await message.reply("❌ Invalid invite link. Provide a Discord invite like `https://discord.gg/abc123`.");
    return;
  }

  let sourceGuildId: string;
  try {
    const invite = await message.client.fetchInvite(inviteCode);
    if (!invite.guild) {
      await message.reply("❌ Could not resolve a server from that invite.");
      return;
    }
    sourceGuildId = invite.guild.id;
  } catch {
    await message.reply("❌ Failed to fetch invite. Make sure it's valid.");
    return;
  }

  const client = message.client;
  const targetGuild = guild;
  const statusMsg = await message.reply("🔄 Joining source server via invite...");

  try {
    await client.rest.post(Routes.invite(inviteCode));
  } catch {
    await statusMsg.edit("❌ Failed to join the source server. The invite may be invalid or expired.");
    return;
  }

  let sourceGuild: Guild;
  try {
    sourceGuild = await waitForGuild(client, sourceGuildId, 15_000);
  } catch {
    await statusMsg.edit("❌ Timed out waiting to join the source server.");
    return;
  }

  try {
    await sourceGuild.channels.fetch();
  } catch {
    await sourceGuild.leave();
    await statusMsg.edit("❌ Failed to fetch channels from source server.");
    return;
  }

  const sourceChannels = [...sourceGuild.channels.cache.values()]
    .filter((c) => !c.isThread())
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const totalToDelete = targetGuild.channels.cache.size;
  const totalToCreate = sourceChannels.length;

  await statusMsg.edit(
    `⚠️ **Server Copy — Confirmation**\n\n` +
    `This will **delete all ${totalToDelete} channels** in this server and create **${totalToCreate} channels** from **${sourceGuild.name}**.\n\n` +
    `Reply with \`yes\` within 30 seconds to confirm.`
  );

  const confirmMessages = await (message.channel as TextChannel).awaitMessages({
    filter: (m: Message) => m.author.id === message.author.id && m.content.toLowerCase() === "yes",
    max: 1,
    time: 30_000,
  }).catch(() => null);

  if (!confirmMessages || confirmMessages.size === 0) {
    await sourceGuild.leave();
    await statusMsg.edit("❌ Copy cancelled (timeout).");
    return;
  }

  const botMember = await targetGuild.members.fetchMe();
  if (!botMember.permissions.has("ManageChannels")) {
    await sourceGuild.leave();
    await statusMsg.edit("❌ I need **Manage Channels** permission.");
    return;
  }

  await statusMsg.edit("🔄 Deleting existing channels...");

  for (const channel of [...targetGuild.channels.cache.values()]) {
    try {
      await channel.delete(`Server copy — replaced by ${sourceGuild.name}`);
    } catch {}
  }

  await statusMsg.edit("🔄 Copying categories and channels...");

  const categoryMap = new Map<string, string | null>();

  for (const src of sourceChannels) {
    if (src.type === ChannelType.GuildCategory) {
      try {
        const created = await targetGuild.channels.create({
          name: src.name,
          type: ChannelType.GuildCategory,
          reason: `Copied from ${sourceGuild.name}`,
        });
        categoryMap.set(src.id, created.id);
      } catch {
        categoryMap.set(src.id, null);
      }
    }
  }

  for (const src of sourceChannels) {
    if (src.type === ChannelType.GuildCategory) continue;

    const parentId = src.parentId ? categoryMap.get(src.parentId) ?? null : null;

    const common = {
      name: src.name,
      parent: parentId,
      reason: `Copied from ${sourceGuild.name}`,
    };

    try {
      switch (src.type) {
        case ChannelType.GuildText:
          await targetGuild.channels.create({ ...common, type: ChannelType.GuildText });
          break;
        case ChannelType.GuildVoice:
          await targetGuild.channels.create({ ...common, type: ChannelType.GuildVoice });
          break;
        case ChannelType.GuildAnnouncement:
          await targetGuild.channels.create({ ...common, type: ChannelType.GuildAnnouncement });
          break;
        case ChannelType.GuildForum:
          await targetGuild.channels.create({ ...common, type: ChannelType.GuildForum });
          break;
        case ChannelType.GuildStageVoice:
          await targetGuild.channels.create({ ...common, type: ChannelType.GuildStageVoice });
          break;
      }
    } catch {}
  }

  await sourceGuild.leave();
  await statusMsg.edit(`✅ Server copy complete! Copied **${totalToCreate} channels** from **${sourceGuild.name}**.`);
}
