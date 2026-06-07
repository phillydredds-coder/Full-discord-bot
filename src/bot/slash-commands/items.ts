import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";
import { ITEMS, RARITY_ORDER, RARITY_CONFIG } from "../battle-data.js";

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

export const data = new SlashCommandBuilder()
  .setName("items")
  .setDescription("Browse all weapons, armor, potions, and buffs");

export async function execute(interaction: ChatInputCommandInteraction) {
  let pageIdx = 0;

  const prevBtn = new ButtonBuilder()
    .setCustomId("items_prev")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Secondary);

  const nextBtn = new ButtonBuilder()
    .setCustomId("items_next")
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn);

  const reply = await interaction.reply({ embeds: [buildPage(pageIdx)], components: [row], fetchReply: true });

  const collector = reply.createMessageComponentCollector<ComponentType.Button>({
    filter: (i) => i.user.id === interaction.user.id,
    time: 30_000,
    idle: 15_000,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "items_prev") {
      pageIdx = (pageIdx - 1 + PAGE_TYPES.length) % PAGE_TYPES.length;
    } else if (i.customId === "items_next") {
      pageIdx = (pageIdx + 1) % PAGE_TYPES.length;
    }
    await i.update({ embeds: [buildPage(pageIdx)], components: [row] });
  });

  collector.on("end", async () => {
    try { await interaction.editReply({ components: [] }); } catch {}
  });
}
