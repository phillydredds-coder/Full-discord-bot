import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";
import * as storage from "../storage.js";

export const name = "rr-setup";
export const aliases = ["setup-rr", "reactionrole-setup", "rr-scan"];
export const usage = `rr-setup <messageId> <emoji> <@role>  —  rr-setup remove <messageId> <emoji>  —  rr-setup list [messageId]  —  rr-setup interactive <messageId>  —  rr-setup scan <messageId>`;

async function resolveRole(message: Message, input: string): Promise<string | null> {
  // Try role mention
  const mention = message.mentions.roles.first();
  if (mention) return mention.id;
  // Try role ID
  if (/^\d{17,20}$/.test(input)) {
    const role = message.guild?.roles.cache.get(input);
    if (role) return role.id;
  }
  // Try role name
  const byName = message.guild?.roles.cache.find((r) => r.name.toLowerCase() === input.toLowerCase());
  if (byName) return byName.id;
  return null;
}

export async function execute(message: Message, args: string[]) {
  if (!message.guild) return;
  const guildId = message.guild.id;
  const txtChannel = message.channel as TextChannel;

  const subcommand = args[0]?.toLowerCase();

  // ── list ──────────────────────────────────────────────────────────────────
  if (subcommand === "list" || (subcommand && !args[1])) {
    const msgId = args[1] || subcommand;
    if (msgId && /^\d{17,20}$/.test(msgId)) {
      const mappings = storage.getCustomReactionRoles(guildId, msgId);
      if (mappings.length === 0) {
        await message.reply(`No mappings for message \`${msgId}\`. Use \`${PREFIX}rr-setup add ${msgId} <emoji> <@role>\` to add.`);
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle(`📋 Reaction Roles — ${msgId}`)
        .setDescription(mappings.map((m) => `${m.emoji} → <@&${m.roleId}>`).join("\n"));
      await message.reply({ embeds: [embed] });
      return;
    }
    // List all messages
    const all = storage.getAllCustomReactionMessages(guildId);
    if (all.length === 0) {
      await message.reply(`No reaction role messages configured. Use \`${PREFIX}rr-setup add <messageId> <emoji> <@role>\` or \`${PREFIX}rr-setup interactive <messageId>\`.`);
      return;
    }
    const lines = await Promise.all(all.map(async (mId) => {
      const count = storage.getCustomReactionRoles(guildId, mId).length;
      return `\`${mId}\` (${count} mapping${count !== 1 ? "s" : ""})`;
    }));
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle("📋 Configured Reaction Role Messages").setDescription(lines.join("\n"))] });
    return;
  }

  // ── remove ────────────────────────────────────────────────────────────────
  if (subcommand === "remove" || subcommand === "rm" || subcommand === "delete") {
    const msgId = args[1];
    const emoji = args[2];
    if (!msgId || !emoji) {
      await message.reply(`Usage: \`${PREFIX}rr-setup remove <messageId> <emoji>\``);
      return;
    }
    const removed = storage.removeCustomReactionRole(guildId, msgId, emoji);
    await message.reply(removed ? `✅ Removed mapping for \`${emoji}\` on message \`${msgId}\`.` : `❌ No mapping found for \`${emoji}\` on that message.`);
    return;
  }

  // ── interactive ───────────────────────────────────────────────────────────
  if (subcommand === "interactive" || subcommand === "auto" || subcommand === "walk") {
    const msgId = args[1];
    const channelId = args[2] || message.channel.id;
    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      await message.reply(`Usage: \`${PREFIX}rr-setup interactive <messageId> [channelId]\` — defaults to current channel`);
      return;
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) {
      await message.reply("❌ Could not find that channel.");
      return;
    }

    let targetMsg: Message;
    try {
      targetMsg = await channel.messages.fetch(msgId);
    } catch {
      await message.reply(`❌ Could not find message \`${msgId}\` in <#${channelId}>.`);
      return;
    }

    const reactions = targetMsg.reactions.cache;
    if (reactions.size === 0) {
      await message.reply("That message has no reactions.");
      return;
    }

    const existing = storage.getCustomReactionRoles(guildId, msgId);
    const remaining = reactions.filter((r) => {
      const key = r.emoji.id ? `${r.emoji.name}:${r.emoji.id}` : r.emoji.name!;
      return !existing.find((e) => e.emoji === key || (!e.isCustom && e.emoji === r.emoji.name));
    });

    if (remaining.size === 0) {
      await message.reply("All reactions on that message are already mapped! Use `" + PREFIX + "rr-setup list " + msgId + "` to see them.");
      return;
    }

    const emojiList = remaining.map((r) => r.emoji.id ? `<${r.emoji.animated ? "a" : ""}:${r.emoji.name}:${r.emoji.id}>` : r.emoji.name!).join(" ");
    const info = await message.reply(
      `🔍 Found **${remaining.size} unmapped reaction${remaining.size > 1 ? "s" : ""}** on message \`${msgId}\`:\n${emojiList}\n\n` +
      `I'll walk through each one. Reply with an **@role mention** or **role ID** for each, or type \`skip\` / \`done\`.`
    );

    const mapped: { emoji: string; roleId: string; isCustom: boolean }[] = [];
    const entries = [...remaining.values()];

    for (let i = 0; i < entries.length; i++) {
      const r = entries[i];
      const displayEmoji = r.emoji.id ? `<${r.emoji.animated ? "a" : ""}:${r.emoji.name}:${r.emoji.id}>` : r.emoji.name!;
      const key = r.emoji.id ? `${r.emoji.name}:${r.emoji.id}` : r.emoji.name!;

      const prompt = await txtChannel.send(`**${i + 1}/${entries.length}** — Role for ${displayEmoji}? (@mention or role ID, or \`skip\`/\`done\`)`);

      const collected = await txtChannel.awaitMessages({
        filter: (m) => m.author.id === message.author.id,
        max: 1,
        time: 30_000,
        errors: ["time"],
      }).catch(() => null);

      if (!collected || collected.size === 0) {
        await txtChannel.send("⏱ Timed out. Setup cancelled.");
        return;
      }

      const reply = collected.first()!;
      const text = reply.content.trim().toLowerCase();

      if (text === "done" || text === "stop" || text === "exit") {
        await txtChannel.send("🛑 Stopped.");
        break;
      }
      if (text === "skip" || text === "s") {
        await txtChannel.send(`⏩ Skipped ${displayEmoji}.`);
        continue;
      }

      const roleId = await resolveRole(message, reply.content.trim());
      if (!roleId) {
        await txtChannel.send(`❌ Could not find role "${reply.content.trim()}". Skipping ${displayEmoji}.`);
        continue;
      }

      mapped.push({ emoji: key, roleId, isCustom: !!r.emoji.id });
      storage.setCustomReactionRole(guildId, msgId, key, roleId, !!r.emoji.id);
      await txtChannel.send(`✅ Saved ${displayEmoji} → <@&${roleId}>`);
    }

    const total = mapped.length;
    if (total > 0) {
      await txtChannel.send(
        `✅ Done! Configured **${total} reaction mapping${total > 1 ? "s" : ""}** for message \`${msgId}\`.\n` +
        `Use \`${PREFIX}rr-setup list ${msgId}\` to view them.`
      );
    } else {
      await txtChannel.send("No mappings were saved.");
    }
    return;
  }

  // ── scan ──────────────────────────────────────────────────────────────────
  // Auto-detect emoji→role mappings from a Carl-bot style reaction role message
  if (subcommand === "scan" || subcommand === "auto-detect") {
    const msgId = args[1];
    const channelId = args[2] || message.channel.id;
    if (!msgId || !/^\d{17,20}$/.test(msgId)) {
      await message.reply(`Usage: \`${PREFIX}rr-setup scan <messageId> [channelId]\` — defaults to current channel`);
      return;
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) {
      await message.reply("❌ Could not find that channel.");
      return;
    }

    let targetMsg: Message;
    try {
      targetMsg = await channel.messages.fetch(msgId);
    } catch {
      await message.reply(`❌ Could not find message \`${msgId}\` in <#${channelId}>.`);
      return;
    }

    const reactions = targetMsg.reactions.cache;
    if (reactions.size === 0) {
      await message.reply("That message has no reactions to scan.");
      return;
    }

    const roleMentions = targetMsg.mentions.roles;
    if (roleMentions.size === 0) {
      await message.reply("No role mentions found in the message text. Make sure Carl-bot's message uses @Role mentions.");
      return;
    }

    const lines = targetMsg.content.split("\n");
    const saved: { emoji: string; roleId: string }[] = [];
    const skipped: string[] = [];

    for (const reaction of reactions.values()) {
      const isCustom = !!reaction.emoji.id;
      // The emoji identifier to match in text
      const emojiDisplay = isCustom
        ? `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`
        : reaction.emoji.name ?? "";
      if (!emojiDisplay) { skipped.push("unknown"); continue; }
      const storageKey = isCustom ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name!;

      const matchedLine = lines.find((line) => line.includes(emojiDisplay));
      if (!matchedLine) {
        skipped.push(emojiDisplay);
        continue;
      }

      // Find a role mention on that line
      const matchedRole = roleMentions.find((role) => matchedLine.includes(`<@&${role.id}>`));
      if (!matchedRole) {
        skipped.push(emojiDisplay);
        continue;
      }

      storage.setCustomReactionRole(guildId, msgId, storageKey, matchedRole.id, isCustom);
      saved.push({ emoji: emojiDisplay, roleId: matchedRole.id });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`✅ Scanned — ${saved.length} mapping${saved.length !== 1 ? "s" : ""}`)
      .setDescription(
        saved.map((s) => `${s.emoji} → <@&${s.roleId}>`).join("\n") +
        (skipped.length > 0 ? `\n\n⚠ Skipped ${skipped.length} emoji${skipped.length !== 1 ? "s" : ""} (no role match): ${skipped.join(" ")}` : "")
      );
    await message.reply({ embeds: [embed] });
    return;
  }

  // ── add (direct) ──────────────────────────────────────────────────────────
  if (subcommand === "add" || (!subcommand)) {
    const msgId = subcommand === "add" ? args[1] : args[0];
    const emoji = subcommand === "add" ? args[2] : args[1];
    const roleInput = subcommand === "add" ? args.slice(3).join(" ") : args.slice(2).join(" ");

    if (!msgId || !emoji || !roleInput) {
      await message.reply(
        `Usage:\n` +
        `  \`${PREFIX}rr-setup add <messageId> <emoji> <@role>\` — Add a mapping\n` +
        `  \`${PREFIX}rr-setup interactive <messageId>\` — Walk through all reactions\n` +
        `  \`${PREFIX}rr-setup list [messageId]\` — List mappings\n` +
        `  \`${PREFIX}rr-setup remove <messageId> <emoji>\` — Remove a mapping`
      );
      return;
    }

    const roleId = await resolveRole(message, roleInput);
    if (!roleId) {
      await message.reply(`❌ Could not find role "${roleInput}". Mention the role or use a role ID.`);
      return;
    }

    storage.setCustomReactionRole(guildId, msgId, emoji, roleId, false);
    await message.reply(`✅ Saved reaction role: ${emoji} → <@&${roleId}> on message \`${msgId}\``);
    return;
  }

  // ── fallback ──────────────────────────────────────────────────────────────
  await message.reply(
    `Usage:\n` +
    `  \`${PREFIX}rr-setup add <messageId> <emoji> <@role>\` — Add a mapping\n` +
    `  \`${PREFIX}rr-setup interactive <messageId>\` — Walk through all reactions\n` +
    `  \`${PREFIX}rr-setup scan <messageId>\` — Auto-detect from Carl-bot message text\n` +
    `  \`${PREFIX}rr-setup list [messageId]\` — List mappings\n` +
    `  \`${PREFIX}rr-setup remove <messageId> <emoji>\` — Remove a mapping`
  );
}
