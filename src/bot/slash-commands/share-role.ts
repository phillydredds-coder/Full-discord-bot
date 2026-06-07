import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
} from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("sharerole")
  .setDescription("Share your custom role with another member")
  .addUserOption((opt) => opt.setName("user").setDescription("User to share your role with").setRequired(true));

const TIMEOUT_MS = 60_000;

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const targetUser = interaction.options.getUser("user", true);
  const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
  if (!targetMember) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ That user is not in this server.")], ephemeral: true });
    return;
  }

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

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ You can't share your role with yourself.")], ephemeral: true });
    return;
  }

  if (targetMember.roles.cache.has(roleId)) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(`❌ ${targetMember.toString()} already has your **${role.name}** role.`)], ephemeral: true });
    return;
  }

  const ts = Date.now();
  const acceptId = `share_accept_${interaction.user.id}_${targetUser.id}_${ts}`;
  const declineId = `share_decline_${interaction.user.id}_${targetUser.id}_${ts}`;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(acceptId).setLabel("✅ Accept").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(declineId).setLabel("❌ Decline").setStyle(ButtonStyle.Danger)
  );

  const promptEmbed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle("Role Share Request")
    .setDescription(`${targetMember.toString()}, **${interaction.user.username}** wants to share their role **${role.name}** with you. Do you want to accept it?`)
    .setFooter({ text: "This request expires in 60 seconds." });

  const channel = interaction.channel;
  if (!channel || !("send" in channel)) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I couldn't post the confirmation prompt in this channel.")], ephemeral: true });
    return;
  }
  const promptMessage = await channel.send({ embeds: [promptEmbed], components: [row] });
  if (!promptMessage) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I couldn't post the confirmation prompt in this channel.")], ephemeral: true });
    return;
  }

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`📨 Sent a role share request for **${role.name}** to ${targetMember.toString()}.`)], ephemeral: true });

  const collector = promptMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === targetUser.id && (i.customId === acceptId || i.customId === declineId),
    time: TIMEOUT_MS,
    max: 1,
  });
  type ButtonInteraction = import("discord.js").ButtonInteraction;

  collector.on("collect", async (buttonInteraction: ButtonInteraction) => {
    await buttonInteraction.deferUpdate();
    if (buttonInteraction.customId === acceptId) {
      try {
        await targetMember.roles.add(role);
        await promptMessage.edit({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ ${targetMember.toString()} accepted the role **${role.name}** from ${interaction.user.toString()}!`)], components: [] });
      } catch {
        await promptMessage.edit({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to assign the role. Check the bot's permissions.")], components: [] });
      }
    } else {
      await promptMessage.edit({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(`❌ ${targetMember.toString()} declined the role share request from ${interaction.user.toString()}.`)], components: [] });
    }
  });

  collector.on("end", async (collected: import("discord.js").Collection<string, import("discord.js").MessageComponentInteraction>) => {
    if (collected.size === 0) {
      await promptMessage.edit({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(`⏱️ The role share request for ${targetMember.toString()} expired with no response.`)], components: [] }).catch(() => {});
    }
  });
}
