import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const name = "give";
export const aliases = ["take"];
export const usage = "give <@user|@everyone|@here> <amount>";

export async function execute(message: Message, args: string[]) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ BOT_CREATOR_ID is not configured.")] });
    return;
  }
  if (message.author.id !== BOT_CREATOR) {
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Only the bot creator can give or take coins.")] });
    return;
  }

  const guild = message.guild;
  if (!guild) return;

  const amount = parseInt(args[1], 10);
  if (isNaN(amount) || amount === 0) {
    await message.reply("❌ Provide a non-zero amount. Positive = give, negative = take.");
    return;
  }

  if (message.mentions.everyone) {
    await guild.members.fetch();
    const isHere = message.content.includes("@here");
    const members = isHere
      ? guild.members.cache.filter((m) => m.presence?.status !== "offline")
      : guild.members.cache;
    const botId = message.client.user!.id;
    let count = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      if (member.user.id === BOT_CREATOR) continue;
      storage.addBalance(guild.id, member.id, amount);
      count++;
    }
    const label = isHere ? "@here" : "@everyone";
    const verb = amount > 0 ? "gave" : "took";
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("💰 Eco Give").setDescription(`${verb} **${Math.abs(amount)}** ${amount > 0 ? "to" : "from"} **${count}** users (${label}).`)] });
    return;
  }

  const target = message.mentions.users.first() || (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);
  if (!target) {
    await message.reply("❌ Mention a user or provide their ID.");
    return;
  }

  storage.addBalance(guild.id, target.id, amount);

  const verb = amount > 0 ? "gave" : "took";
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle("💰 Eco Give")
    .setDescription(`${verb} **${Math.abs(amount)}** ${amount > 0 ? "to" : "from"} ${target}.`)
    .setFooter({ text: `New balance: ${storage.getBalance(guild.id, target.id)}` });
  await message.reply({ embeds: [embed] });
}
