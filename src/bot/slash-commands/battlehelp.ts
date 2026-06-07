import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("battlehelp")
  .setDescription("Show all battle commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("⚔️ Battle Commands")
    .setDescription("Fight monsters, level up, collect loot, and climb the leaderboard!")
    .addFields(
      { name: "/battle", value: "Auto-fight a random monster. HP resets to full. Rewards scale with your streak!", inline: false },
      { name: "/profile", value: "View your level, HP, attack, defense, XP bar, equipment, and win streak.", inline: false },
      { name: "/inventory", value: "View all items you're carrying (potions, weapons, armor, buffs).", inline: false },
      { name: "/use <item>", value: "Use a potion (heal HP), equip weapons/armor, or activate a buff potion (3 battles).", inline: false },
      { name: "/leaderboard", value: "Top 10 battlers ranked by wins and level.", inline: false },
      { name: "/autohunt", value: "Toggle auto-hunting. Battles chain instantly on win; stops on defeat.", inline: false },
      { name: "/battlehelp", value: "Shows this battle help menu.", inline: false },
    )
    .addFields(
      { name: "✨ Buff Potions (bought from /economy shop or found as drops)", value: "**🍀 Luck Potion** — 3x drop rate for 3 battles\n**📈 XP Potion** — 3x XP for 3 battles\n**👾 Horde Potion** — Fight 3 enemies in one battle!", inline: false },
      { name: "🔥 Streak System", value: "Win consecutively to build your streak. Higher streak = harder enemies but way better rewards (XP, coins, drops). Lose to reset.", inline: false },
      { name: "🏪 Shop Tiers", value: "Spend coins earned from battling to buy ♡ Tier 1–5 role perks. Use /economy shop to browse.", inline: false },
    );

  await interaction.reply({ embeds: [embed] });
}
