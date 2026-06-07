import { Message, EmbedBuilder } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "economy-help";
export const aliases = ["eh"];
export const usage = "economy-help";

export async function execute(message: Message, _args: string[]) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Economy & Gambling Commands")
    .setDescription(
      `Earn coins by chatting (10s cooldown), then spend them in the shop or gamble them for more!`
    )
    .addFields(
      {
        name: `**💰 Economy**`,
        value: [
          `\`${PREFIX}balance\` (\`${PREFIX}bal\`) — Check your coin balance.`,
          `\`${PREFIX}shop\` — Browse the role tier shop and buy tiers with coins.`,
          `\`${PREFIX}give @user <amount>\` (\`${PREFIX}take @user <amount>\`) — Give or take coins. Bot-creator only.`,
        ].join("\n"),
        inline: false,
      },
      {
        name: `**🎲 Gambling** — max bet 2,500 coins, win = double`,
        value: [
          `\`${PREFIX}gamble coinflip <amount> <heads|tails>\` (\`${PREFIX}g cf\`) — 50/50 chance to double up.`,
          `\`${PREFIX}gamble blackjack <amount>\` (\`${PREFIX}g bj\`) — Beat the dealer (16+ stand).`,
          `\`${PREFIX}gamble slots <amount>\` (\`${PREFIX}g sl\`) — 🍒🍒🍒 match 3 to win big!`,
          `\`${PREFIX}gamble spin <amount>\` (\`${PREFIX}g sp\`) — Spin the wheel for up to 5x payout.`,
          `\`${PREFIX}gamble cards <amount> <higher|lower>\` (\`${PREFIX}g cd\`) — Guess the next card.`,
          `Aliases: \`${PREFIX}bet\`, \`${PREFIX}gambling\``,
        ].join("\n"),
        inline: false,
      },
      {
        name: `**⚔️ Battle** — earn coins by fighting!`,
        value: `Use \`${PREFIX}battle\` (\`${PREFIX}hunt\`) to fight monsters for XP, coins, and loot drops. See \`${PREFIX}bb\` or \`${PREFIX}battlehelp\` for all battle commands.`,
        inline: false,
      },
    );

  await message.reply({ embeds: [embed] });
}
