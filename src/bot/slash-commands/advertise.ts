import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("advertise")
  .setDescription("DM an invite to members in mutual servers");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: false });

  const inviteCode = "bbydollz";

  await interaction.editReply("🔄 Gathering mutual server members...");

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

  const total = uniqueUsers.size;
  if (total === 0) {
    await interaction.editReply("❌ No members found in mutual servers to advertise to.");
    return;
  }

  await interaction.editReply(
    `⚠️ This will DM **${total} users** across ${interaction.client.guilds.cache.size - 1} other servers with an invite to **${guild.name}**.\n\n` +
    `Press the button below within 30 seconds to confirm.`
  );

  const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ad_confirm").setLabel("Confirm — Send DMs").setStyle(ButtonStyle.Danger).setEmoji("📨"),
    new ButtonBuilder().setCustomId("ad_cancel").setLabel("Cancel").setStyle(ButtonStyle.Secondary),
  );

  const confirmMsg = await interaction.editReply({ content: null, components: [confirmRow] });

  let confirmed = false;
  try {
    const btnInteraction = await confirmMsg.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
      componentType: ComponentType.Button,
    });

    if (btnInteraction.customId === "ad_confirm") {
      confirmed = true;
      await btnInteraction.deferUpdate();
    } else {
      await btnInteraction.deferUpdate();
    }
  } catch {
    await interaction.editReply({ content: "❌ Canceled.", components: [] });
    return;
  }

  if (!confirmed) {
    await interaction.editReply({ content: "❌ Canceled.", components: [] });
    return;
  }

  await interaction.editReply({ content: `🔄 Advertising to ${total} users...`, components: [] });

  let sent = 0;
  let failed = 0;

  for (const [userId] of uniqueUsers) {
    try {
      const user = await interaction.client.users.fetch(userId);
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
      await interaction.editReply(`🔄 Advertising... **${sent}** sent, **${failed}** failed (${sent + failed}/${total})`);
    }
  }

  await interaction.editReply(`✅ Done! Advertised **${guild.name}** to **${sent}** users (${failed} couldn't be reached).`);
}
