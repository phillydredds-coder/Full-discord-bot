import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("rr-setup")
  .setDescription("Configure custom reaction roles for a message")
  .addSubcommand((sub) =>
    sub.setName("add")
      .setDescription("Add a reaction→role mapping")
      .addStringOption((o) => o.setName("message-id").setDescription("Message ID with reactions").setRequired(true))
      .addStringOption((o) => o.setName("emoji").setDescription("Emoji character or name").setRequired(true))
      .addRoleOption((o) => o.setName("role").setDescription("Role to assign").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("remove")
      .setDescription("Remove a reaction→role mapping")
      .addStringOption((o) => o.setName("message-id").setDescription("Message ID").setRequired(true))
      .addStringOption((o) => o.setName("emoji").setDescription("Emoji to remove").setRequired(true))
  )
  .addSubcommand((sub) =>
    sub.setName("list")
      .setDescription("List all reaction role mappings")
      .addStringOption((o) => o.setName("message-id").setDescription("Optional message ID to filter by").setRequired(false))
  )
  .addSubcommand((sub) =>
    sub.setName("scan")
      .setDescription("Auto-detect emoji→role mappings from a Carl-bot style message")
      .addStringOption((o) => o.setName("message-id").setDescription("Message ID to scan").setRequired(true))
      .addChannelOption((o) => o.setName("channel").setDescription("Channel the message is in (defaults to current)").setRequired(false))
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const guildId = interaction.guild.id;
  const sub = interaction.options.getSubcommand();

  if (sub === "add") {
    const msgId = interaction.options.getString("message-id", true);
    const emoji = interaction.options.getString("emoji", true);
    const role = interaction.options.getRole("role", true);

    storage.setCustomReactionRole(guildId, msgId, emoji, role.id, false);
    await interaction.reply({ content: `✅ Saved reaction role: ${emoji} → ${role} on message \`${msgId}\``, ephemeral: true });
    return;
  }

  if (sub === "remove") {
    const msgId = interaction.options.getString("message-id", true);
    const emoji = interaction.options.getString("emoji", true);

    const removed = storage.removeCustomReactionRole(guildId, msgId, emoji);
    await interaction.reply({
      content: removed
        ? `✅ Removed mapping for \`${emoji}\` on message \`${msgId}\`.`
        : `❌ No mapping found for \`${emoji}\` on that message.`,
      ephemeral: true,
    });
    return;
  }

  if (sub === "list") {
    const msgId = interaction.options.getString("message-id");

    if (msgId) {
      const mappings = storage.getCustomReactionRoles(guildId, msgId);
      if (mappings.length === 0) {
        await interaction.reply({ content: `No mappings for message \`${msgId}\`.`, ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle(`📋 Reaction Roles — ${msgId}`)
        .setDescription(mappings.map((m) => `${m.emoji} → <@&${m.roleId}>`).join("\n"));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const all = storage.getAllCustomReactionMessages(guildId);
    if (all.length === 0) {
      await interaction.reply({ content: "No reaction role messages configured yet.", ephemeral: true });
      return;
    }
    const lines = all.map((mId) => {
      const count = storage.getCustomReactionRoles(guildId, mId).length;
      return `\`${mId}\` (${count} mapping${count !== 1 ? "s" : ""})`;
    });
    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle("📋 Configured Reaction Role Messages")
      .setDescription(lines.join("\n"));
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "scan") {
    const msgId = interaction.options.getString("message-id", true);
    const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel | null;
    if (!channel?.isTextBased()) {
      await interaction.reply({ content: "❌ Invalid channel.", ephemeral: true });
      return;
    }

    let targetMsg;
    try {
      targetMsg = await channel.messages.fetch(msgId);
    } catch {
      await interaction.reply({ content: `❌ Could not find message \`${msgId}\` in ${channel}.`, ephemeral: true });
      return;
    }

    const reactions = targetMsg.reactions.cache;
    if (reactions.size === 0) {
      await interaction.reply({ content: "That message has no reactions to scan.", ephemeral: true });
      return;
    }
    const roleMentions = targetMsg.mentions.roles;
    if (roleMentions.size === 0) {
      await interaction.reply({ content: "No role mentions found in the message text.", ephemeral: true });
      return;
    }

    const lines = targetMsg.content.split("\n");
    const saved: { emoji: string; roleId: string }[] = [];
    const skipped: string[] = [];

    for (const reaction of reactions.values()) {
      const isCustom = !!reaction.emoji.id;
      const emojiDisplay = isCustom
        ? `<${reaction.emoji.animated ? "a" : ""}:${reaction.emoji.name}:${reaction.emoji.id}>`
        : reaction.emoji.name ?? "";
      if (!emojiDisplay) { skipped.push("unknown"); continue; }
      const storageKey = isCustom ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name!;

      const matchedLine = lines.find((line) => line.includes(emojiDisplay));
      if (!matchedLine) { skipped.push(emojiDisplay); continue; }

      const matchedRole = roleMentions.find((role) => matchedLine.includes(`<@&${role.id}>`));
      if (!matchedRole) { skipped.push(emojiDisplay); continue; }

      storage.setCustomReactionRole(interaction.guild.id, msgId, storageKey, matchedRole.id, isCustom);
      saved.push({ emoji: emojiDisplay, roleId: matchedRole.id });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`✅ Scanned — ${saved.length} mapping${saved.length !== 1 ? "s" : ""}`)
      .setDescription(
        saved.map((s) => `${s.emoji} → <@&${s.roleId}>`).join("\n") +
        (skipped.length > 0 ? `\n\n⚠ Skipped ${skipped.length} emoji${skipped.length !== 1 ? "s" : ""}: ${skipped.join(" ")}` : "")
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }
}
