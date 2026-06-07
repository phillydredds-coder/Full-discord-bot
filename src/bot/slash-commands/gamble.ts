import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("gamble")
  .setDescription("Gamble your coins on games of chance")
  .addSubcommand((s) =>
    s.setName("coinflip").setDescription("Bet on heads or tails")
      .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1).setMaxValue(25000))
      .addStringOption((o) => o.setName("choice").setDescription("Heads or tails").setRequired(true).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" }))
  )
  .addSubcommand((s) =>
    s.setName("blackjack").setDescription("Play blackjack against the dealer")
      .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1).setMaxValue(25000))
  )
  .addSubcommand((s) =>
    s.setName("slots").setDescription("Spin the slot machine")
      .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1).setMaxValue(25000))
  )
  .addSubcommand((s) =>
    s.setName("spin").setDescription("Spin the wheel of fate")
      .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1).setMaxValue(25000))
  )
  .addSubcommand((s) =>
    s.setName("cards").setDescription("Guess if the next card is higher or lower")
      .addIntegerOption((o) => o.setName("amount").setDescription("Coins to bet").setRequired(true).setMinValue(1).setMaxValue(25000))
      .addStringOption((o) => o.setName("choice").setDescription("Higher or lower").setRequired(true).addChoices({ name: "Higher", value: "higher" }, { name: "Lower", value: "lower" }))
  );

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

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true });
    return;
  }

  const userId = interaction.user.id;
  const sub = interaction.options.getSubcommand();
  const amount = interaction.options.getInteger("amount", true);

  const bal = storage.getBalance(guild.id, userId);
  if (bal < amount) {
    await interaction.reply({ content: `❌ You only have ${bal} coins. You need ${amount}.`, ephemeral: true });
    return;
  }

  storage.addBalance(guild.id, userId, -amount);

  if (sub === "coinflip") {
    const choice = interaction.options.getString("choice", true);
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const win = choice === result;

    if (win) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🪙 Coinflip")
        .setDescription(`It landed **${result}**! You picked **${choice}**.\nYou won **${amount * 2}** coins! 🎉`);
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🪙 Coinflip")
        .setDescription(`It landed **${result}**! You picked **${choice}**.\nYou lost **${amount}** coins. 💔`);
      await interaction.reply({ embeds: [embed] });
    }
    return;
  }

  if (sub === "blackjack") {
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
    } else if (finalDealerTotal > 21 || playerTotal > finalDealerTotal) {
      won = true;
    }

    if (won) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🃏 Blackjack")
        .setDescription(`**You:** ${playerStr} = **${playerTotal}**\n**Dealer:** ${finalDealerStr} = **${finalDealerTotal}**\n\nYou won **${amount * 2}** coins! 🎉`);
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🃏 Blackjack")
        .setDescription(`**You:** ${playerStr} = **${playerTotal}**${bust ? " (bust!)" : ""}\n**Dealer:** ${finalDealerStr} = **${finalDealerTotal}**\n\nYou lost **${amount}** coins. 💔`);
      await interaction.reply({ embeds: [embed] });
    }
    return;
  }

  if (sub === "slots") {
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
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🎰 Slots")
        .setDescription(`[ ${r1} | ${r2} | ${r3} ]\n\nNo match. You lost **${amount}** coins. 💔`);
      await interaction.reply({ embeds: [embed] });
    }
    return;
  }

  if (sub === "spin") {
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
      await interaction.reply({ embeds: [embed] });
    } else if (outcome.mult === 0) {
      storage.addBalance(guild.id, userId, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle("🎡 Wheel Spin")
        .setDescription(`${outcome.label}\nNo coins lost. 🔄`);
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🎡 Wheel Spin")
        .setDescription(`${outcome.label}\nYou lost **${amount}** coins. 💔`);
      await interaction.reply({ embeds: [embed] });
    }
    return;
  }

  if (sub === "cards") {
    const choice = interaction.options.getString("choice", true);
    const pick = choice === "higher" || choice === "high" || choice === "h" ? "higher" : "lower";

    const first = drawCard();
    const second = drawCard();
    const tie = second.value === first.value;
    const won = pick === "higher" ? second.value > first.value : second.value < first.value;

    if (tie) {
      storage.addBalance(guild.id, userId, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\n\nIt's a tie — you get your bet back! 🔄`);
      await interaction.reply({ embeds: [embed] });
    } else if (won) {
      storage.addBalance(guild.id, userId, amount * 2);
      const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\nYou guessed **${pick}** and won **${amount * 2}** coins! 🎉`);
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setTitle("🃏 High/Low")
        .setDescription(`First card: **${first.display}**\nNext card: **${second.display}**\nYou guessed **${pick}** and lost **${amount}** coins. 💔`);
      await interaction.reply({ embeds: [embed] });
    }
    return;
  }

  storage.addBalance(guild.id, userId, amount);
  await interaction.reply({ content: "❌ Unknown game.", ephemeral: true });
}
