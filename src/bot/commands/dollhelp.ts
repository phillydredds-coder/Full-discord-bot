import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "dollhelp";
export const aliases = ["help", "h"];
export const usage = "dollhelp";

const PAGES = [
  {
    label: "Overview",
    emoji: "🩷",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("🩷 DollHelp — Command Index")
        .setDescription(
          `Welcome to **♡₊˚ Babydoll ˚₊♡**!\n` +
          `Use the navigation buttons below to browse all commands by category.\n\n` +
          `**${PREFIX}Dollhelp** — Shows this menu (alias: \`${PREFIX}help\`)\n` +
          `All commands also work as **slash commands** (type \`/\` in chat).\n` +
          `Prefix: \`${PREFIX}\` (comma)`
        )
        .addFields(
          { name: "📌 Quick Links", value: [
            `**Page 2** 🧑‍🤝‍🧑 — Custom Role Commands`,
            `**Page 3** 🛡️ — Moderation & Utility`,
            `**Page 4** 💰 — Economy & Gambling`,
            `**Page 5** ⚔️ — Battle & Items`,
          ].join("\n"), inline: false },
          { name: "🌐 Server", value: "discord.gg/bbydollz", inline: true },
          { name: "📌 Tip", value: `Try \`${PREFIX}help <category>\` to jump directly!`, inline: true },
        ),
  },
  {
    label: "Custom Roles",
    emoji: "🧑‍🤝‍🧑",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("🧑‍🤝‍🧑 Custom Role Commands")
        .setDescription("Create and customize your own server role. Only the role owner can modify or delete it.")
        .addFields(
          { name: `\`${PREFIX}create-role <name>\` (\`${PREFIX}cr\`)`, value: "Creates your personal custom role and assigns it to you.", inline: false },
          { name: `\`${PREFIX}role-name <name>\` (\`${PREFIX}rn\`)`, value: "Renames your custom role.", inline: false },
          { name: `\`${PREFIX}role-color <#RRGGBB>\` (\`${PREFIX}rc\`)`, value: "Changes your role color using a HEX code (e.g. `#FFCFE6`).", inline: false },
          { name: `\`${PREFIX}role-icon <emoji>\` (\`${PREFIX}ri\`)`, value: "Sets a server emoji as your role icon. Requires Server Boost Level 2.", inline: false },
          { name: `\`${PREFIX}role-info <@role>\` (\`${PREFIX}rinfo\`)`, value: "Shows detailed info about a role (color, icon, permissions, members).", inline: false },
          { name: `\`${PREFIX}share-role @user\` (\`${PREFIX}sr\`)`, value: "Sends the mentioned user a prompt to accept your custom role.", inline: false },
          { name: `\`${PREFIX}delete-role\` (\`${PREFIX}dr\`)`, value: "Permanently deletes your custom role from the server.", inline: false },
          { name: `\`${PREFIX}reaction-role\` (\`${PREFIX}rr\`)`, value: "Opens a role menu to pick pronoun, gender, and ping roles.", inline: false },
          { name: `\`${PREFIX}rr-setup\` (\`${PREFIX}setup-rr\`)`, value: "Configure custom reaction roles (add/remove/list/interactive/scan). Works independently of Carl-bot.", inline: false },
        ),
  },
  {
    label: "Moderation & Utility",
    emoji: "🛡️",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("🛡️ Moderation & Utility Commands")
        .setDescription("Moderation commands require appropriate permissions. Utility commands have their own requirements.")
        .addFields(
          {
            name: "**Moderation**",
            value: [
              `\`${PREFIX}ban @user [reason]\` (\`${PREFIX}b\`) — Ban a user. Requires Ban Members.`,
              `\`${PREFIX}kick @user [reason]\` (\`${PREFIX}k\`) — Kick a user. Requires Kick Members.`,
              `\`${PREFIX}mute @user <duration>\` (\`${PREFIX}m\`) — Timeout a user (e.g. \`2d 3h 41m\`). Requires Moderate Members.`,
              `\`${PREFIX}unmute @user\` (\`${PREFIX}um\`) — Remove an active timeout.`,
              `\`${PREFIX}sobboard [#channel]\` (\`${PREFIX}sb\`) — Set or view the sob board channel.`,
            ].join("\n"),
            inline: false,
          },
          {
            name: "**Info**",
            value: [
              `\`${PREFIX}serverinfo\` (\`${PREFIX}si\`) — Server stats, boost level, member count, channels.`,
              `\`${PREFIX}role-info @role\` (\`${PREFIX}rinfo\`) — Role details (color, icon, permissions, member count).`,
              `\`${PREFIX}inviteinfo <code>\` (\`${PREFIX}ii\`) — Invite stats (channel, uses, created by, expiration).`,
            ].join("\n"),
            inline: false,
          },
          {
            name: "**Server Tools**",
            value: [
              `\`${PREFIX}server-copier <invite>\` (\`${PREFIX}scopy\`) — Join a server via invite, copy all channels/categories, then leave. Requires Manage Server.`,
              `\`${PREFIX}updatelog\` (\`${PREFIX}uplog\`) — View the bot's changelog.`,
              `\`${PREFIX}addupdate <version> <date> <changes>\` (\`${PREFIX}newupdate\`) — Add a changelog entry. Requires Manage Server.`,
              `\`${PREFIX}advertise\` (\`${PREFIX}ad\`) — DM your server invite to all mutual-server users. Requires Manage Server.`,
              `\`${PREFIX}promoview\` (\`${PREFIX}pv\`) — Preview how many users ,ad can reach.`,
            ].join("\n"),
            inline: false,
          },
          {
            name: "**Bot Owner**",
            value: [
              `\`${PREFIX}restart\` (\`${PREFIX}reboot\`) — Restart the bot.`,
              `\`${PREFIX}huntadmin\` (\`${PREFIX}ha\`) — Edit any player's battle stats (HP, atk, def, weapon, armor, gem, items, chain battles).`,
              `\`${PREFIX}give @user <amount>\` (\`${PREFIX}take\`) — Give or take coins from any user.`,
              `\`${PREFIX}reseteconomy\` (\`${PREFIX}reseteco\`) — Reset ALL coins and cute coins for every user (irreversible!).`,
            ].join("\n"),
            inline: false,
          },
        ),
  },
  {
    label: "Economy & Gambling",
    emoji: "💰",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("💰 Economy & Gambling Commands")
        .setDescription("Earn coins by battling and cute coins by chatting (10s cooldown). Spend in the shop or gamble for more!")
        .addFields(
          {
            name: "**Economy**",
            value: [
              `\`${PREFIX}balance\` (\`${PREFIX}bal\`) — Check your coin and cute coin balance.`,
              `\`${PREFIX}shop\` — Browse the role tier shop and buy tiers with coins.`,
              `\`${PREFIX}steal @user <amount>\` — Try to steal coins from another user (50% success, half penalty on fail, 60s cooldown per target).`,
            ].join("\n"),
            inline: false,
          },
          {
            name: "**🎲 Gambling** — max bet 25,000 coins, win = double",
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
        ),
  },
  {
    label: "Battle & Items",
    emoji: "⚔️",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("⚔️ Battle & Items Commands")
        .setDescription("Fight monsters, level up, collect loot, and climb the leaderboard!")
        .addFields(
          { name: `\`${PREFIX}battle\` / \`${PREFIX}hunt\` / \`${PREFIX}fight\``, value: "Auto-fight a random monster. HP resets to full before each battle. Rewards scale with your **streak**!", inline: false },
          { name: `\`${PREFIX}profile\` / \`${PREFIX}stats\` / \`${PREFIX}p\``, value: "View your level, HP, attack, defense, XP bar, equipment, win streak, and battle stats.", inline: false },
          { name: `\`${PREFIX}inventory\` / \`${PREFIX}inv\` / \`${PREFIX}items\` / \`${PREFIX}i\``, value: "View all items you're carrying (potions, weapons, armor, buffs).", inline: false },
          { name: `${PREFIX}use <item>`, value: "Use a potion (heal HP), equip weapons/armor, or activate a buff potion. See " + PREFIX + "inv for your items.", inline: false },
          { name: `\`${PREFIX}leaderboard\` / \`${PREFIX}lb\` / \`${PREFIX}top\``, value: "Top 10 battlers ranked by wins and level.", inline: false },
          { name: `\`${PREFIX}autohunt\` / \`${PREFIX}ah\` / \`${PREFIX}autobattle\` / \`${PREFIX}ab\``, value: "Toggle auto-hunting. Battles chain instantly on each win; stops automatically on defeat.", inline: false },
          { name: `\`${PREFIX}gear\` / \`${PREFIX}itemdb\` / \`${PREFIX}idb\` / \`${PREFIX}gearlist\``, value: "Browse all weapons, armor, potions, buffs, chests, and gems by category.", inline: false },
          { name: `\`${PREFIX}bb\` / \`${PREFIX}battlehelp\` / \`${PREFIX}bh\``, value: "Shows detailed battle help with buff potions and streak info.", inline: false },
        )
        .addFields(
          {
            name: "✨ **Buff Potions**",
            value: "**🍀 Luck Potion** — 3x drop rate for 3 battles\n**📈 XP Potion** — 3x XP for 3 battles\n**👾 Horde Potion** — Fight 3 enemies in one battle!\n**⚡ Elixir of Power** — +20 Attack for 3 battles\n**🍺 Berserker Brew** — +35 Attack, -10 Defense for 3 battles\n**✨ Divine Blessing** — All buffs active for 5 battles!\n**🛡️ Fortitude Potion** — +15 Defense for 3 battles\n**❤️‍🔥 Rage Potion** — +50 Attack for 2 battles\n**🏰 Guardian Elixir** — +30 Defense for 4 battles\n**⚡ Overdrive Potion** — +100 Attack for 2 battles",
            inline: false,
          },
          {
            name: "📦 **Chests & 💎 Gems**",
            value: "**Chests** (Common→Secret) — Use to get a random weapon/armor of that rarity.\n**XP Gems** (1.5x→10000x) — Equip for a passive XP multiplier in all battles!",
            inline: false,
          },
          { name: "👑 **Bosses**", value: "5% chance per battle to fight a boss instead of a regular enemy. Bosses have way higher HP, attack, defense, and give massive XP, coins, and guaranteed drops!", inline: false },
          { name: "🔥 **Streak System**", value: "Win consecutively to increase your streak. Higher streak = **harder enemies** but **way better rewards** (more XP, coins, and higher drop chance). Lose once to reset.", inline: false },
        ),
  },
];

export async function execute(message: Message, args: string[]) {
  let pageIdx = 0;

  if (args[0]) {
    const idx = PAGES.findIndex((p) =>
      p.label.toLowerCase().startsWith(args[0].toLowerCase()) ||
      p.emoji === args[0]
    );
    if (idx !== -1) pageIdx = idx;
  }

  const prevBtn = new ButtonBuilder()
    .setCustomId("dh_prev")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Secondary);

  const pageBtn = new ButtonBuilder()
    .setCustomId("dh_page")
    .setLabel(`${pageIdx + 1}/${PAGES.length}`)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const nextBtn = new ButtonBuilder()
    .setCustomId("dh_next")
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, pageBtn, nextBtn);

  const msg = await message.reply({ embeds: [PAGES[pageIdx].build()], components: [row] });

  const collector = msg.createMessageComponentCollector<ComponentType.Button>({
    filter: (i) => i.user.id === message.author.id,
    time: 60_000,
    idle: 20_000,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "dh_prev") {
      pageIdx = (pageIdx - 1 + PAGES.length) % PAGES.length;
    } else if (i.customId === "dh_next") {
      pageIdx = (pageIdx + 1) % PAGES.length;
    }
    pageBtn.setLabel(`${pageIdx + 1}/${PAGES.length}`);
    await i.update({ embeds: [PAGES[pageIdx].build()], components: [row] });
  });

  collector.on("end", async () => {
    try { await msg.edit({ components: [] }); } catch {}
  });
}
