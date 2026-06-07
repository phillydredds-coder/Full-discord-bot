import { Message, EmbedBuilder } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";
import * as storage from "../storage.js";

export const name = "gamble";
export const aliases = ["bet", "gambling"];
export const usage = "gamble <coinflip|cf|blackjack|bj|slots|sl|spin|sp|cards|cd> <amount> [choice]";

const MAX_BET = 25000;

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawCard(): { display: string; value: number } {
  const suits = ["♠", "♥", "♣", "♦"];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suit = suits[random(0, 3)];
  const rank = ranks[random(0, 12)];
  const value = rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : parseInt(rank, 10);
  return { display: `${rank}${suit}`, value };
}

function handValue(cards: { display: string; value: number }[]): number {
  let total = cards.reduce((sum, c) => sum + c.value, 0);
  let aces = cards.filter((c) => c.display.startsWith("A")).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function spinReel(): string {
  const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐", "🎀"];
  return symbols[random(0, symbols.length - 1)];
}

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;
  const userId = message.author.id;

  if (!args[0]) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle("🩷 Gamble Commands")
      .setDescription(
        `**Max bet:** ${MAX_BET} coins per game\n**Win:** Double your bet!\n\n` +
        `\`,gamble coinflip|cf <amount> <heads|tails>\` — 50/50 chance\n` +
        `\`,gamble blackjack|bj <amount>\` — Beat the dealer (21)\n` +
        `\`,gamble slots|sl <amount>\` — Match 3 symbols to win\n` +
        `\`,gamble spin|sp <amount>\` — Spin the wheel of fate\n` +
        `\`,gamble cards|cd <amount> <higher|lower>\` — Guess the next card`
      );
    await message.reply({ embeds: [embed] });
    return;
  }

  const sub = args[0].toLowerCase();
  const amount = parseInt(args[1], 10);

  if (!amount || amount < 1 || amount > MAX_BET) {
    await message.reply(`❌ Bet must be between 1 and ${MAX_BET} coins.`);
    return;
  }

  const bal = storage.getBalance(guild.id, userId);
  if (bal < amount) {
    await message.reply(`❌ You only have ${bal} coins. You need ${amount}.`);
    return;
  }

  storage.addBalance(guild.id, userId, -amount);

  if (["coinflip", "cf"].includes(sub)) {
    const choice = args[2]?.toLowerCase();
    if (!choice || !["heads", "tails", "h", "t"].includes(choice)) {
      storage.addBalance(guild.id, userId, amount);
      await message.reply("❌ Choose `heads` or `tails`.");
      return;
    }

    const pick = choice === "heads" || choice === "h" ? "heads" : "tails";
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const win = pick === result;

    if (win) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🪙 Coinflip")
        .setDescription(`It landed **${result}**! You picked **${pick}**.\nYou won **${amount * 2}** coins! 🎉`);
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🪙 Coinflip")
        .setDescription(`It landed **${result}**! You picked **${pick}**.\nYou lost **${amount}** coins. 💔`);
      await message.reply({ embeds: [embed] });
    }
    return;
  }

  if (["blackjack", "bj"].includes(sub)) {
    const playerHand = [drawCard(), drawCard()];
    const dealerHand = [drawCard(), drawCard()];

    let playerTotal = handValue(playerHand);
    const dealerTotal = handValue(dealerHand);

    let stood = false;
    let bust = false;

    while (playerTotal < 21 && !stood) {
      if (playerTotal >= 17) {
        stood = true;
      } else {
        playerHand.push(drawCard());
        playerTotal = handValue(playerHand);
        if (playerTotal > 21) { bust = true; break; }
        if (playerTotal >= 17) { stood = true; }
      }
    }

    if (playerTotal > 21) bust = true;

    const playerStr = playerHand.map((c) => c.display).join(" ");
    const dealerStr = dealerHand.map((c) => c.display).join(" ");

    let finalDealerTotal = dealerTotal;
    if (!bust) {
      while (finalDealerTotal < 17) {
        dealerHand.push(drawCard());
        finalDealerTotal = handValue(dealerHand);
      }
    }

    const finalDealerStr = dealerHand.map((c) => c.display).join(" ");

    let won = false;
    if (bust) {
      // player bust
    } else if (finalDealerTotal > 21 || playerTotal > finalDealerTotal) {
      won = true;
    }

    if (won) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🃏 Blackjack")
        .setDescription(
          `**You:** ${playerStr} = **${playerTotal}**\n**Dealer:** ${finalDealerStr} = **${finalDealerTotal}**\n\nYou won **${amount * 2}** coins! 🎉`
        );
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🃏 Blackjack")
        .setDescription(
          `**You:** ${playerStr} = **${playerTotal}**${bust ? " (bust!)" : ""}\n**Dealer:** ${finalDealerStr} = **${finalDealerTotal}**\n\nYou lost **${amount}** coins. 💔`
        );
      await message.reply({ embeds: [embed] });
    }
    return;
  }

  if (["slots", "sl"].includes(sub)) {
    const r1 = spinReel();
    const r2 = spinReel();
    const r3 = spinReel();

    const win = r1 === r2 && r2 === r3;

    if (win) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🎰 Slots")
        .setDescription(`[ ${r1} | ${r2} | ${r3} ]\n\nJackpot! You won **${amount * 2}** coins! 🎉`);
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🎰 Slots")
        .setDescription(`[ ${r1} | ${r2} | ${r3} ]\n\nNo match. You lost **${amount}** coins. 💔`);
      await message.reply({ embeds: [embed] });
    }
    return;
  }

  if (["spin", "sp", "wheel"].includes(sub)) {
    const outcomes = [
      { label: "🎉 Big Win!", mult: 3, chance: 0.1 },
      { label: "✨ Small Win!", mult: 1.5, chance: 0.25 },
      { label: "🔄 Push — refund", mult: 0, chance: 0.15 },
      { label: "💔 Lose", mult: -1, chance: 0.5 },
    ];

    const roll = Math.random();
    let cumulative = 0;
    let outcome = outcomes[outcomes.length - 1];

    for (const o of outcomes) {
      cumulative += o.chance;
      if (roll <= cumulative) { outcome = o; break; }
    }

    if (outcome.mult >= 1) {
      const winnings = Math.floor(amount * outcome.mult);
      storage.addBalance(guild.id, userId, amount + winnings);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🎡 Wheel Spin")
        .setDescription(`${outcome.label}\nYou won **${winnings}** coins! 🎉`);
      await message.reply({ embeds: [embed] });
    } else if (outcome.mult === 0) {
      storage.addBalance(guild.id, userId, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle("🎡 Wheel Spin")
        .setDescription(`${outcome.label}\nNo coins lost. 🔄`);
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🎡 Wheel Spin")
        .setDescription(`${outcome.label}\nYou lost **${amount}** coins. 💔`);
      await message.reply({ embeds: [embed] });
    }
    return;
  }

  if (["cards", "card", "cd"].includes(sub)) {
    const choice = args[2]?.toLowerCase();
    if (!choice || !["higher", "lower", "high", "low", "h", "l"].includes(choice)) {
      storage.addBalance(guild.id, userId, amount);
      await message.reply("❌ Guess `higher` or `lower`.");
      return;
    }

    const pick = choice === "higher" || choice === "high" || choice === "h" ? "higher" : "lower";

    const first = drawCard();
    const second = drawCard();

    const won = pick === "higher" ? second.value > first.value : second.value < first.value;
    const tie = second.value === first.value;

    if (tie) {
      storage.addBalance(guild.id, userId, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\n\nIt's a tie — you get your bet back! 🔄`);
      await message.reply({ embeds: [embed] });
    } else if (won) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\nYou guessed **${pick}** and won **${amount * 2}** coins! 🎉`);
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\nYou guessed **${pick}** and lost **${amount}** coins. 💔`);
      await message.reply({ embeds: [embed] });
    }
    return;
  }

  storage.addBalance(guild.id, userId, amount);
  await message.reply(`❌ Unknown game. Use \`${PREFIX}gamble\` to see options.`);
}
