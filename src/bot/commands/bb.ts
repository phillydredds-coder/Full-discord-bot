import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const name = "bb";
export const aliases = ["battlehelp", "bh"];
export const usage = "bb";

export async function execute(message: Message, _args: string[]) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("⚔️ Battle Commands")
    .setDescription("Fight monsters, level up, collect loot, and climb the leaderboard!")
    .addFields(
      { name: "**,battle** / **,hunt** / **,fight**", value: "Auto-fight a random monster. HP resets to full before each battle. Rewards scale with your **streak**!", inline: false },
      { name: "**,profile** / **,stats** / **,p**", value: "View your level, HP, attack, defense, XP bar, equipment, win streak, and battle stats.", inline: false },
      { name: "**,inventory** / **,inv** / **,items** / **,i**", value: "View all items you're carrying (potions, weapons, armor, buffs).", inline: false },
      { name: "**,use <item>**", value: "Use a **potion** (heal HP), **equip** weapons/armor, or activate a **buff potion** (3-battle duration). See `,inv` for your items.", inline: false },
      { name: "**,leaderboard** / **,lb** / **,top**", value: "Top 10 battlers ranked by wins and level.", inline: false },
      { name: "**,autohunt** / **,ah** / **,autobattle** / **,ab**", value: "Toggle auto-hunting. Battles chain instantly on each win; stops automatically on defeat.", inline: false },
      { name: "**,bb** / **,battlehelp** / **,bh**", value: "Shows this battle help menu.", inline: false },
    )
    .addFields(
      { name: "✨ **Buff Potions** (bought from `,shop` or found as drops)", value: "**🍀 Luck Potion** — 3x drop rate for 3 battles\n**📈 XP Potion** — 3x XP for 3 battles\n**👾 Horde Potion** — Fight 3 enemies in one battle!", inline: false },
      { name: "🔥 **Streak System**", value: "Win consecutively to increase your streak. Higher streak = **harder enemies** but **way better rewards** (more XP, coins, and higher drop chance). Lose once to reset.", inline: false },
      { name: "🏪 **Shop Tiers**", value: "Spend coins earned from battling to buy ♡ Tier 1–5 role perks. Use `,shop` to browse.", inline: false },
    );

  await message.reply({ embeds: [embed] });
}
