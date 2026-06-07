import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("economyhelp")
  .setDescription("Show economy, shop, and gambling commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Economy & Gambling Commands")
    .setDescription("Earn coins by chatting, spend them in the shop, or gamble for more!")
    .addFields(
      {
        name: "**💰 Economy**",
        value: [
          "/economy balance — Check your coin balance.",
          "/economy shop — Browse the role tier shop.",
          "/economy buy <tier> — Buy a role tier with coins.",
          "/give <user> <amount> — Give or take coins. Bot-creator only.",
        ].join("\n"),
        inline: false,
      },
      {
        name: "**🎲 Gambling** — max bet 2,500 coins",
        value: [
          "/gamble coinflip <amount> <heads|tails> — 50/50 chance to double up.",
          "/gamble blackjack <amount> — Beat the dealer (16+ stand).",
          "/gamble slots <amount> — Match 3 to win big!",
          "/gamble spin <amount> — Spin the wheel for up to 5x payout.",
          "/gamble cards <amount> <higher|lower> — Guess the next card.",
        ].join("\n"),
        inline: false,
      },
      {
        name: "**⚔️ Battle**",
        value: "Use /battle to fight monsters for XP, coins, and loot drops. See /battlehelp for all battle commands.",
        inline: false,
      },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
