import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, RARITY_ORDER, RARITY_CONFIG } from "../battle-data.js";

export const data = new SlashCommandBuilder()
  .setName("inventory")
  .setDescription("View your battle inventory");

const ITEMS_PER_PAGE = 25;

const CATEGORIES: { key: string; emoji: string; label: string; types: string[] }[] = [
  { key: "weapons", emoji: "⚔️", label: "Weapons", types: ["weapon"] },
  { key: "armor", emoji: "🛡️", label: "Armor", types: ["armor"] },
  { key: "potions", emoji: "🧪", label: "Potions", types: ["potion"] },
  { key: "buffs", emoji: "✨", label: "Buffs", types: ["buff"] },
  { key: "chests", emoji: "📦", label: "Chests", types: ["chest"] },
  { key: "gems", emoji: "💎", label: "Gems", types: ["gem"] },
];

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const p = storage.getBattlePlayer(guild.id, interaction.user.id);
  const allEntries = Object.entries(p.inventory).filter(([, count]) => count > 0);

  if (allEntries.length === 0) {
    await interaction.reply("🎒 Your inventory is empty.");
    return;
  }

  const itemMap = new Map(allEntries);

  function getCategoryEntries(types: string[]) {
    return Array.from(itemMap.entries())
      .filter(([id]) => {
        const item = ITEMS.find((i) => i.id === id);
        return item && types.includes(item.type);
      })
      .map(([id, count]) => {
        const item = ITEMS.find((i) => i.id === id)!;
        return { id, count, item };
      })
      .sort((a, b) => RARITY_ORDER.indexOf(a.item.rarity) - RARITY_ORDER.indexOf(b.item.rarity));
  }

  function buildEmbed(cat: typeof CATEGORIES[number], page: number): EmbedBuilder {
    const entries = getCategoryEntries(cat.types);
    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const pageEntries = entries.slice(start, start + ITEMS_PER_PAGE);

    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`${cat.emoji} ${interaction.user.username}'s ${cat.label}`);

    for (const { id, count, item } of pageEntries) {
      const equipped = p.weapon === id || p.armor === id;
      const rarityCfg = RARITY_CONFIG[item.rarity];
      embed.addFields({
        name: `${rarityCfg.emoji} ${item.emoji} ${item.name} x${count}${equipped ? " *(equipped)*" : ""}`,
        value: `${item.description} | ${rarityCfg.label} | Sell: ${item.value} coins`,
        inline: false,
      });
    }

    embed.setFooter({ text: `Page ${page + 1}/${totalPages} • ${entries.length} items` });
    return embed;
  }

  const available = CATEGORIES.filter((c) => getCategoryEntries(c.types).length > 0);

  function buildCatRows() {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < available.length; i += 5) {
      const row2 = new ActionRowBuilder<ButtonBuilder>();
      for (const cat of available.slice(i, i + 5)) {
        row2.addComponents(
          new ButtonBuilder()
            .setCustomId(`cat_${cat.key}`)
            .setEmoji(cat.emoji)
            .setLabel(cat.label)
            .setStyle(ButtonStyle.Secondary),
        );
      }
      rows.push(row2);
    }
    return rows;
  }

  const total = allEntries.length;
  const welcomeEmbed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
    .setDescription(`You have **${total}** item${total === 1 ? "" : "s"}.\nPick a category below to browse.`);

  const sent = await interaction.reply({ embeds: [welcomeEmbed], components: buildCatRows(), fetchReply: true });

  const collector = sent.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000,
    filter: (i) => i.user.id === interaction.user.id,
  });

  let state: { cat: typeof CATEGORIES[number]; page: number } | null = null;

  collector.on("collect", async (i) => {
    if (i.customId.startsWith("cat_")) {
      const key = i.customId.slice(4);
      const cat = available.find((c) => c.key === key);
      if (!cat) return;
      state = { cat, page: 0 };
    } else if (i.customId === "back" && state) {
      showCategories();
      return;
    } else if (state) {
      if (i.customId === "prev") state.page--;
      else if (i.customId === "next") state.page++;
    }

    if (!state) return;

    const entries = getCategoryEntries(state.cat.types);
    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);

    if (state.page < 0) state.page = 0;
    if (state.page >= totalPages) state.page = totalPages - 1;

    const embed = buildEmbed(state.cat, state.page);

    const navRow = new ActionRowBuilder<ButtonBuilder>();
    navRow.addComponents(
      new ButtonBuilder()
        .setCustomId("back")
        .setEmoji("↩️")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀")
        .setLabel("Prev")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(state.page === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶")
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(state.page >= totalPages - 1),
    );

    await i.update({ embeds: [embed], components: [navRow] });
  });

  function showCategories() {
    state = null;
    sent.edit({ embeds: [welcomeEmbed], components: buildCatRows() }).catch(() => {});
  }

  collector.on("end", async () => {
    const disabled = buildCatRows();
    for (const row2 of disabled) {
      row2.components.forEach((c: ButtonBuilder) => c.setDisabled(true));
    }
    await sent.edit({ components: disabled }).catch(() => {});
  });
}
