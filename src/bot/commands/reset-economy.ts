import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const name = "reseteconomy";
export const aliases = ["reseteco", "eco-reset"];
export const usage = "reseteconomy";

export async function execute(message: Message, _args: string[]) {
  const BOT_CREATOR_ID = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR_ID || message.author.id !== BOT_CREATOR_ID) {
    await message.reply("Only the bot creator can use this command.");
    return;
  }

  const guild = message.guild;
  if (!guild) return;

  const confirmEmbed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("⚠️ Reset Economy?")
    .setDescription("This will **delete ALL** coins and cute coins for every user in this server. This **cannot** be undone!")
    .setFooter({ text: "Are you absolutely sure?" });

  const confirmBtn = new ButtonBuilder()
    .setCustomId("confirm_reset")
    .setLabel("Yes, Reset Everything")
    .setStyle(ButtonStyle.Danger);
  const cancelBtn = new ButtonBuilder()
    .setCustomId("cancel_reset")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancelBtn, confirmBtn);

  const sent = await message.reply({ embeds: [confirmEmbed], components: [row] });

  const collected = await sent.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 30_000,
    filter: (i) => i.user.id === message.author.id,
  }).catch(() => null);

  if (!collected || collected.customId === "cancel_reset") {
    await sent.edit({ embeds: [confirmEmbed.setDescription("❌ Reset cancelled.")], components: [] }).catch(() => {});
    return;
  }

  storage.resetAllBalances(guild.id);
  await collected.update({
    embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("✅ Economy Reset").setDescription("All coins and cute coins have been wiped clean.")],
    components: [],
  });
}
