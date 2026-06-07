import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ChannelType, Events, Guild, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { Routes } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("server-copier")
  .setDescription("Copy all channels/categories from another server using its invite link")
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addStringOption((o) =>
    o.setName("invite").setDescription("Invite link of the server to copy").setRequired(true)
  );

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

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  const member = interaction.member;
  if (!guild || !member) {
    await interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
    return;
  }

  if (typeof member.permissions === "string" || !member.permissions.has("ManageGuild")) {
    await interaction.reply({ content: "❌ You need **Manage Server** permission to use this.", ephemeral: true });
    return;
  }

  const inviteInput = interaction.options.getString("invite", true);
  const inviteCode = extractInviteCode(inviteInput);
  if (!inviteCode) {
    await interaction.reply({ content: "❌ Invalid invite link. Provide a Discord invite like `https://discord.gg/abc123`.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: false });

  let sourceGuildId: string;
  try {
    const invite = await interaction.client.fetchInvite(inviteCode);
    if (!invite.guild) {
      await interaction.editReply({ content: "❌ Could not resolve a server from that invite." });
      return;
    }
    sourceGuildId = invite.guild.id;
  } catch {
    await interaction.editReply({ content: "❌ Failed to fetch invite. Make sure it's valid." });
    return;
  }

  const client = interaction.client;
  const targetGuild = guild;

  await interaction.editReply("🔄 Joining source server via invite...");

  try {
    await client.rest.post(Routes.invite(inviteCode));
  } catch {
    await interaction.editReply("❌ Failed to join the source server. The invite may be invalid or expired.");
    return;
  }

  let sourceGuild: Guild;
  try {
    sourceGuild = await waitForGuild(client, sourceGuildId, 15_000);
  } catch {
    await interaction.editReply("❌ Timed out waiting to join the source server.");
    return;
  }

  try {
    await sourceGuild.channels.fetch();
  } catch {
    await sourceGuild.leave();
    await interaction.editReply("❌ Failed to fetch channels from source server.");
    return;
  }

  const sourceChannels = [...sourceGuild.channels.cache.values()]
    .filter((c) => !c.isThread())
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const totalToDelete = targetGuild.channels.cache.size;
  const totalToCreate = sourceChannels.length;

  await interaction.editReply(
    `⚠️ **Server Copy — Confirmation**\n\n` +
    `This will **delete all ${totalToDelete} channels** in this server and create **${totalToCreate} channels** from **${sourceGuild.name}**.\n\n` +
    `Press the button below within 30 seconds to confirm.`
  );

  const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("scopy_confirm").setLabel("Confirm — Copy Server").setStyle(ButtonStyle.Danger).setEmoji("⚠️"),
    new ButtonBuilder().setCustomId("scopy_cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary),
  );

  const confirmMsg = await interaction.editReply({ content: null, components: [confirmRow] });

  let confirmed = false;
  try {
    const btnInteraction = await confirmMsg.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
      componentType: ComponentType.Button,
    });

    if (btnInteraction.customId === "scopy_confirm") {
      confirmed = true;
      await btnInteraction.deferUpdate();
    } else {
      await btnInteraction.deferUpdate();
    }
  } catch {
    await sourceGuild.leave();
    await interaction.editReply({ content: "❌ Copy cancelled (timeout).", components: [] });
    return;
  }

  if (!confirmed) {
    await sourceGuild.leave();
    await interaction.editReply({ content: "❌ Copy cancelled.", components: [] });
    return;
  }

  await interaction.editReply({ content: "🔄 Deleting existing channels...", components: [] });

  for (const channel of [...targetGuild.channels.cache.values()]) {
    try {
      await channel.delete(`Server copy — replaced by ${sourceGuild.name}`);
    } catch {}
  }

  await interaction.editReply({ content: "🔄 Copying categories and channels..." });

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
  await interaction.editReply({ content: `✅ Server copy complete! Copied **${totalToCreate} channels** from **${sourceGuild.name}**.` });
}
