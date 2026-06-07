import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildMember,
} from "discord.js";
import { getOwnerRole } from "../storage.js";
import { COLORS } from "../constants.js";

export const name = "share-role";
export const aliases = ["sr"];
export const usage = "share-role @user";

const TIMEOUT_MS = 60_000;

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild || !(message.member instanceof GuildMember)) return;

  const roleId = getOwnerRole(guild.id, message.author.id);
  if (!roleId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You don't own a custom role. Create one with `,create-role <name>`.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Your custom role no longer exists. Use `,create-role` to make a new one.");
    await message.reply({ embeds: [embed] });
    return;
  }

  const targetId = message.mentions.users.first()?.id;
  if (!targetId) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ Please mention a user to share your role with. Usage: `,share-role @user`");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (targetId === message.author.id) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ You can't share your role with yourself.");
    await message.reply({ embeds: [embed] });
    return;
  }

  let targetMember: GuildMember;
  try {
    targetMember = await guild.members.fetch(targetId);
  } catch {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription("❌ That user isn't in this server.");
    await message.reply({ embeds: [embed] });
    return;
  }

  if (targetMember.roles.cache.has(roleId)) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription(`❌ ${targetMember.toString()} already has your **${role.name}** role.`);
    await message.reply({ embeds: [embed] });
    return;
  }

  const ts = Date.now();
  const acceptId = `share_accept_${message.author.id}_${targetId}_${ts}`;
  const declineId = `share_decline_${message.author.id}_${targetId}_${ts}`;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(acceptId).setLabel("✅ Accept").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(declineId).setLabel("❌ Decline").setStyle(ButtonStyle.Danger)
  );

  const promptEmbed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle("Role Share Request")
    .setDescription(
      `${targetMember.toString()}, **${message.author.username}** wants to share their role **${role.name}** with you.\n\nDo you want to accept it?`
    )
    .setFooter({ text: "This request expires in 60 seconds." });

  const textChannel = message.channel;
  if (!textChannel || !("send" in textChannel)) {
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ I couldn't send the role share request in this channel.")] });
    return;
  }
  const prompt = await textChannel.send({
    content: targetMember.toString(),
    embeds: [promptEmbed],
    components: [row],
  });

  const collector = prompt.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === targetId && (i.customId === acceptId || i.customId === declineId),
    time: TIMEOUT_MS,
    max: 1,
  });
  type ButtonInteraction = import("discord.js").ButtonInteraction;

  collector.on("collect", async (interaction: ButtonInteraction) => {
    await interaction.deferUpdate();
    if (interaction.customId === acceptId) {
      try {
        await targetMember.roles.add(role);
        await prompt.edit({
          embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(
            `✅ ${targetMember.toString()} accepted the role **${role.name}** from ${message.author.toString()}!`
          )],
          components: [],
        });
      } catch {
        await prompt.edit({
          embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Failed to assign the role. Check the bot's permissions.")],
          components: [],
        });
      }
    } else {
      await prompt.edit({
        embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(
          `❌ ${targetMember.toString()} declined the role share request from ${message.author.toString()}.`
        )],
        components: [],
      });
    }
  });

  collector.on("end", async (collected: import("discord.js").Collection<string, import("discord.js").MessageComponentInteraction>) => {
    if (collected.size === 0) {
      await prompt.edit({
        embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(
          `⏱️ The role share request for ${targetMember.toString()} expired with no response.`
        )],
        components: [],
      }).catch(() => {});
    }
  });

  await message.reply({
    embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(
      `📨 Sent a role share request for **${role.name}** to ${targetMember.toString()}. They have 60 seconds to respond.`
    )],
  });
}
