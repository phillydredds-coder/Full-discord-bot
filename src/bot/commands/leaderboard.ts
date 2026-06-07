import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { ITEMS, RARITY_ORDER } from "../battle-data.js";

export const name = "leaderboard";
export const aliases = ["lb", "top"];
export const usage = "leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LBEntry {
  userId: string;
  value: string;
  sort: number;
}

const CATEGORIES = [
  {
    key: "coins", emoji: "🪙", label: "Most Coins",
    getter: (guildId: string) => {
      const all = storage.getAllBalances(guildId);
      return all.filter((e) => e.coins > 0).sort((a, b) => b.coins - a.coins).slice(0, 10).map((e) => ({ userId: e.userId, value: `${e.coins.toLocaleString()} coins`, sort: e.coins }));
    },
  },
  {
    key: "cute", emoji: "🩷", label: "Most Cute Coins",
    getter: (guildId: string) => {
      const all = storage.getAllBalances(guildId);
      return all.filter((e) => e.cuteCoins > 0).sort((a, b) => b.cuteCoins - a.cuteCoins).slice(0, 10).map((e) => ({ userId: e.userId, value: `${e.cuteCoins.toLocaleString()} cute coins`, sort: e.cuteCoins }));
    },
  },
  {
    key: "level", emoji: "⭐", label: "Highest Level",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle).sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp).slice(0, 10).map(([userId, p]) => ({ userId, value: `Level ${p.level} (${p.xp} XP)`, sort: p.level }));
    },
  },
  {
    key: "wins", emoji: "🏆", label: "Most Wins",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle).sort((a, b) => b[1].wins - a[1].wins).slice(0, 10).map(([userId, p]) => ({ userId, value: `${p.wins} wins`, sort: p.wins }));
    },
  },
  {
    key: "streak", emoji: "🔥", label: "Highest Streak",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle).sort((a, b) => b[1].streak - a[1].streak).slice(0, 10).map(([userId, p]) => ({ userId, value: `${p.streak} win streak`, sort: p.streak }));
    },
  },
  {
    key: "ratio", emoji: "📊", label: "Best Win Ratio",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle)
        .filter(([, p]) => p.battles > 0)
        .map(([userId, p]) => ({ userId, data: p, ratio: p.wins / p.battles }))
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 10)
        .map((e) => ({ userId: e.userId, value: `${(e.ratio * 100).toFixed(1)}% (${e.data.wins}/${e.data.battles})`, sort: e.ratio }));
    },
  },
  {
    key: "invvalue", emoji: "💰", label: "Most Inventory Value",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle)
        .map(([userId, p]) => {
          const value = Object.entries(p.inventory).reduce((sum, [id, count]) => {
            const item = ITEMS.find((i) => i.id === id);
            return sum + (item?.value ?? 0) * count;
          }, 0);
          return { userId, value };
        })
        .filter((e) => e.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map((e) => ({ userId: e.userId, value: `${e.value.toLocaleString()} coins`, sort: e.value }));
    },
  },
  {
    key: "rareweapon", emoji: "🗡️", label: "Rarest Weapon",
    getter: (guildId: string) => {
      const raw = storage.getGuildRaw(guildId);
      if (!raw?.battle) return [];
      return Object.entries(raw.battle)
        .filter(([, p]) => p.weapon)
        .map(([userId, p]) => {
          const item = ITEMS.find((i) => i.id === p.weapon);
          const rarityIdx = item ? RARITY_ORDER.indexOf(item.rarity) : -1;
          return { userId, weapon: item, rarityIdx };
        })
        .filter((e) => e.weapon)
        .sort((a, b) => b.rarityIdx - a.rarityIdx)
        .slice(0, 10)
        .map((e) => ({ userId: e.userId, value: `${e.weapon!.emoji} ${e.weapon!.name} (${e.weapon!.rarity})`, sort: e.rarityIdx }));
    },
  },
];

function buildCategoryRows() {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < CATEGORIES.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const cat of CATEGORIES.slice(i, i + 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`lb_${cat.key}`)
          .setEmoji(cat.emoji)
          .setLabel(cat.label)
          .setStyle(ButtonStyle.Secondary),
      );
    }
    rows.push(row);
  }
  return rows;
}

const welcomeEmbed = new EmbedBuilder()
  .setColor(COLORS.PINK)
  .setTitle("🏆 Leaderboard")
  .setDescription("Pick a category to see the top 10!");

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const sent = await message.reply({ embeds: [welcomeEmbed], components: buildCategoryRows() });

  const collector = sent.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000,
    filter: (i) => i.user.id === message.author.id,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "lb_back") {
      await i.update({ embeds: [welcomeEmbed], components: buildCategoryRows() });
      return;
    }

    const key = i.customId.slice(3);
    const cat = CATEGORIES.find((c) => c.key === key);
    if (!cat) return;

    const entries = cat.getter(guild.id);
    if (entries.length === 0) {
      await i.update({ embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle(`${cat.emoji} ${cat.label}`).setDescription("No data yet.")], components: [] });
      return;
    }

    let desc = "";
    for (let i2 = 0; i2 < entries.length; i2++) {
      const e = entries[i2];
      const medal = MEDALS[i2] ?? `**${i2 + 1}.**`;
      let name = `<@${e.userId}>`;
      try {
        const user = await message.client.users.fetch(e.userId);
        name = user.username;
      } catch {}
      desc += `${medal} ${name} — ${e.value}\n`;
    }

    const backBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("lb_back")
        .setEmoji("↩️")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary),
    );

    await i.update({
      embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle(`${cat.emoji} ${cat.label}`).setDescription(desc)],
      components: [backBtn],
    });
  });

  collector.on("end", async () => {
    const disabled = buildCategoryRows();
    for (const row of disabled) {
      row.components.forEach((c: ButtonBuilder) => c.setDisabled(true));
    }
    await sent.edit({ components: disabled }).catch(() => {});
  });
}
