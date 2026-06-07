import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const name = "steal";
export const aliases: string[] = [];
export const usage = "steal <@user>";

const STEAL_COOLDOWN = 60_000;
const MAX_STEAL = 1000;

const stealCooldowns = new Map<string, number>();

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const target = message.mentions.users.first();
  if (!target) {
    await message.reply("Usage: `,steal <@user>`");
    return;
  }

  if (target.id === message.author.id) {
    await message.reply("You can't steal from yourself!");
    return;
  }

  if (target.bot) {
    await message.reply("You can't steal from a bot!");
    return;
  }

  const cooldownKey = `${message.author.id}:${target.id}`;
  const lastSteal = stealCooldowns.get(cooldownKey) || 0;
  const remaining = STEAL_COOLDOWN - (Date.now() - lastSteal);
  if (remaining > 0) {
    await message.reply(`You need to wait **${Math.ceil(remaining / 1000)}s** before trying to steal from ${target.username} again.`);
    return;
  }

  const coinsBtn = new ButtonBuilder()
    .setCustomId("coins")
    .setEmoji("🪙")
    .setLabel("Coins")
    .setStyle(ButtonStyle.Secondary);
  const cuteBtn = new ButtonBuilder()
    .setCustomId("cute")
    .setEmoji("🩷")
    .setLabel("Cute Coins")
    .setStyle(ButtonStyle.Secondary);
  const cancelBtn = new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(coinsBtn, cuteBtn, cancelBtn);

  const promptEmbed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle(`🦹 What to steal from ${target.username}?`)
    .setDescription("Pick which currency you want to try stealing.");

  const sent = await message.reply({ embeds: [promptEmbed], components: [row] });

  const collected = await sent.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 30_000,
    filter: (i) => i.user.id === message.author.id,
  }).catch(() => null);

  if (!collected || collected.customId === "cancel") {
    await sent.edit({ embeds: [promptEmbed.setDescription("❌ Cancelled.")], components: [] }).catch(() => {});
    return;
  }

  const isCute = collected.customId === "cute";

  const targetBal = isCute
    ? storage.getCuteCoins(guild.id, target.id)
    : storage.getBalance(guild.id, target.id);

  if (targetBal < 1) {
    await collected.update({
      embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`${target.username} doesn't have any ${isCute ? "cute " : ""}coins to steal.`)],
      components: [],
    });
    return;
  }

  stealCooldowns.set(cooldownKey, Date.now());

  const amount = Math.min(Math.floor(Math.random() * MAX_STEAL) + 1, targetBal);

  const thiefBal = storage.getBalance(guild.id, message.author.id);
  const penalty = Math.floor(amount / 2);

  if (thiefBal < penalty) {
    await collected.update({
      embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`You need at least **${penalty}** coins to attempt a steal (in case you get caught!).`)],
      components: [],
    });
    return;
  }

  const currencyLabel = isCute ? "🩷 cute coins" : "🪙 coins";

  const resultEmbed = new EmbedBuilder()
    .setTitle(`🦹 ${message.author.username} tries to steal ${currencyLabel} from ${target.username}!`);

  const success = Math.random() < 0.5;

  if (success) {
    if (isCute) {
      storage.addCuteCoins(guild.id, message.author.id, amount);
      storage.addCuteCoins(guild.id, target.id, -amount);
    } else {
      storage.addBalance(guild.id, message.author.id, amount);
      storage.addBalance(guild.id, target.id, -amount);
    }
    resultEmbed
      .setColor(0x00ff00)
      .setDescription(`**Success!** 🎉 You snatched **${amount}** ${currencyLabel} from ${target.username}!`);
  } else {
    storage.addBalance(guild.id, message.author.id, -penalty);
    resultEmbed
      .setColor(0xff0000)
      .setDescription(`**Caught!** 🚨 ${target.username} caught you red-handed! You were fined **${penalty}** 🪙 coins.`);
  }

  await collected.update({ embeds: [resultEmbed], components: [] });
}
