import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("give")
  .setDescription("Give or take coins from a user (bot creator only)")
  .addUserOption((o) => o.setName("user").setDescription("Target user").setRequired(true))
  .addIntegerOption((o) => o.setName("amount").setDescription("Amount (positive=give, negative=take)").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ BOT_CREATOR_ID is not configured.")], ephemeral: true });
    return;
  }
  if (interaction.user.id !== BOT_CREATOR) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Only the bot creator can give or take coins.")], ephemeral: true });
    return;
  }

  const guild = interaction.guild;
  if (!guild) return;

  const target = interaction.options.getUser("user", true);
  const amount = interaction.options.getInteger("amount", true);

  if (amount === 0) {
    await interaction.reply({ content: "❌ Amount must be non-zero.", ephemeral: true });
    return;
  }

  storage.addBalance(guild.id, target.id, amount);

  const verb = amount > 0 ? "gave" : "took";
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle("💰 Eco Give")
    .setDescription(`${verb} **${Math.abs(amount)}** ${amount > 0 ? "to" : "from"} ${target}.`)
    .setFooter({ text: `New balance: ${storage.getBalance(guild.id, target.id)}` });
  await interaction.reply({ embeds: [embed] });
}
