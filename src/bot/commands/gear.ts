import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import { ITEMS, RARITY_ORDER, RARITY_CONFIG } from "../battle-data.js";

export const name = "gear";
export const aliases = ["itemdb", "idb", "gearlist"];
export const usage = "gear [weapons|armor|potions]";

const PAGE_TYPES = [
  { label: "Weapons", type: "weapon", emoji: "🗡️", desc: "Offensive gear to boost your Attack." },
  { label: "Armor", type: "armor", emoji: "🛡️", desc: "Defensive gear to boost your Defense." },
  { label: "Potions & Buffs", type: "potion", emoji: "🧪", desc: "Consumables — healing, buffs, and special effects." },
];

function buildPage(pageIdx: number): EmbedBuilder {
  const page = PAGE_TYPES[pageIdx];
  const items = ITEMS.filter((i) => i.type === page.type || (page.type === "potion" && i.type === "buff"));

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle(`${page.emoji} ${page.label}`)
    .setDescription(`${page.desc}\n\u200b`)
    .setFooter({ text: `Page ${pageIdx + 1}/${PAGE_TYPES.length} • Rarity increases from Common → Secret` });

  if (items.length === 0) {
    embed.addFields({ name: "No items yet", value: "Check back later!" });
    return embed;
  }

  for (const rarity of RARITY_ORDER) {
    const filtered = items.filter((i) => i.rarity === rarity);
    if (filtered.length === 0) continue;
    const cfg = RARITY_CONFIG[rarity];
    const lines = filtered.map((item) => {
      const stat = item.effect !== undefined
        ? item.type === "weapon" ? ` +${item.effect} Atk`
          : item.type === "armor" ? ` +${item.effect} Def`
          : item.type === "potion" ? ` ${item.description}`
          : item.type === "buff" ? ` ${item.description}`
          : ""
        : "";
      return `${item.emoji} **${item.name}**${stat} — ${item.value} coins`;
    });
    embed.addFields({ name: `${cfg.emoji} ${cfg.label}`, value: lines.join("\n"), inline: false });
  }

  return embed;
}

export async function execute(message: Message, args: string[]) {
  let pageIdx = 0;
  if (args[0]) {
    const idx = PAGE_TYPES.findIndex((p) => p.label.toLowerCase().startsWith(args[0].toLowerCase()));
    if (idx !== -1) pageIdx = idx;
  }

  const msg = await message.reply({ embeds: [buildPage(pageIdx)] });
  if (PAGE_TYPES.length < 2) return;

  await msg.react("◀️");
  await msg.react("▶️");

  const filter = (_r: any, user: any) => user.id === message.author.id;
  const collector = msg.createReactionCollector({ filter, time: 30_000, idle: 15_000 });

  collector.on("collect", async (reaction, user) => {
    if (reaction.emoji.name === "◀️") {
      pageIdx = (pageIdx - 1 + PAGE_TYPES.length) % PAGE_TYPES.length;
    } else if (reaction.emoji.name === "▶️") {
      pageIdx = (pageIdx + 1) % PAGE_TYPES.length;
    }
    await reaction.users.remove(user.id);
    await msg.edit({ embeds: [buildPage(pageIdx)] });
  });

  collector.on("end", async () => {
    try { await msg.reactions.removeAll(); } catch {}
  });
}
