import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("dollhelp")
  .setDescription("Show all bot commands organized by category");

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
          `**/dollhelp** — Shows this menu\n` +
          `All commands also work as **prefix commands** with \`${PREFIX}\` (comma).`
        )
        .addFields(
          { name: "📌 Quick Links", value: [
            `**Page 2** 🧑‍🤝‍🧑 — Custom Role Commands`,
            `**Page 3** 🛡️ — Moderation & Utility`,
            `**Page 4** 💰 — Economy & Gambling`,
            `**Page 5** ⚔️ — Battle & Items`,
          ].join("\n"), inline: false },
          { name: "🌐 Server", value: "discord.gg/bbydollz", inline: true },
          { name: "📌 Tip", value: `Try \`${PREFIX}dollhelp <category>\` to jump directly!`, inline: true },
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
          { name: "`/createrole <name>`", value: "Creates your personal custom role and assigns it to you.", inline: false },
          { name: "`/rolename <name>`", value: "Renames your custom role.", inline: false },
          { name: "`/rolecolor <#RRGGBB>`", value: "Changes your role color with a HEX code (e.g. `#FFCFE6`).", inline: false },
          { name: "`/roleicon <emoji>`", value: "Sets a server emoji as your role icon. Requires Server Boost Level 2.", inline: false },
          { name: "`/roleinfo <role>`", value: "Shows detailed info about a role (color, icon, permissions, members).", inline: false },
          { name: "`/sharerole <user>`", value: "Sends a prompt so another member can accept your role.", inline: false },
          { name: "`/deleterole`", value: "Permanently deletes your personal role from the server.", inline: false },
          { name: "`/reactionrole`", value: "Opens a role menu to pick pronoun, gender, and ping roles.", inline: false },
          { name: "`/rolehelp`", value: "Shows the custom role help message.", inline: false },
        ),
  },
  {
    label: "Moderation & Utility",
    emoji: "🛡️",
    build: () =>
      new EmbedBuilder()
        .setColor(COLORS.PINK)
        .setTitle("🛡️ Moderation & Utility Commands")
        .setDescription("Moderation commands require appropriate permissions.")
        .addFields(
          {
            name: "**Moderation**",
            value: [
              "/ban <user> [reason] — Ban a user. Requires Ban Members.",
              "/kick <user> [reason] — Kick a user. Requires Kick Members.",
              "/mute <user> <duration> — Timeout a user (e.g. 2d 3h 41m).",
              "/unmute <user> — Remove an active timeout.",
              "/reactionrole — Opens pronoun/gender/ping role menu. Requires Manage Roles.",
              "/sobboard [#channel] — Set or view the sob board channel.",
            ].join("\n"),
            inline: false,
          },
          {
            name: "**Info**",
            value: [
              "/serverinfo — Server stats, boost level, member count, channels.",
              "/roleinfo <role> — Role details (color, icon, permissions, member count).",
              "/inviteinfo <code> — Invite stats (channel, uses, created by, expiration).",
            ].join("\n"),
            inline: false,
          },
          {
            name: "**Server Tools**",
            value: [
              "/server-copier <invite> — Join and copy all channels/categories. Requires Manage Server.",
              "/updatelog — View the bot's changelog.",
              "/addupdate — Add a changelog entry. Requires Manage Server.",
              "/advertise — DM your server invite to all mutual-server users. Requires Manage Server.",
              "/promoview — Preview how many users /advertise can reach.",
              "/huntadmin — Edit battle stats, chain battles, manage auth. Bot-creator + authorized.",
              "/restart — Restart the bot. Bot-creator only.",
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
        .setDescription("Earn coins by battling and cute coins by chatting. Spend in the shop, gamble, or steal from others!")
        .addFields(
          {
            name: "**Economy**",
            value: [
              "/economy balance — Check your coin and cute coin balance.",
              "/economy shop — Browse the role tier shop.",
              "/economy buy <tier> — Buy a role tier with coins.",
              "/steal <user> <amount> — Try to steal coins (50% success, half penalty on fail, 60s cooldown).",
              "/give <user> <amount> — Give or take coins. Bot-creator only.",
              "/reseteconomy — Reset ALL coins and cute coins. Bot-creator only.",
            ].join("\n"),
            inline: false,
          },
          {
            name: "**🎲 Gambling** — max bet 25,000 coins",
            value: [
              "/gamble coinflip <amount> <heads|tails> — 50/50 chance to double up.",
              "/gamble blackjack <amount> — Beat the dealer (16+ stand).",
              "/gamble slots <amount> — Match 3 to win big!",
              "/gamble spin <amount> — Spin the wheel for up to 5x payout.",
              "/gamble cards <amount> <higher|lower> — Guess the next card.",
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
          { name: "/battle", value: "Auto-fight a random monster. HP resets to full. Rewards scale with your streak!", inline: false },
          { name: "/profile", value: "View your level, HP, attack, defense, XP bar, equipment, and win streak.", inline: false },
          { name: "/inventory", value: "View all items you're carrying (potions, weapons, armor, buffs).", inline: false },
          { name: "/use <item>", value: "Use a potion (heal HP), equip weapons/armor, or activate a buff potion.", inline: false },
          { name: "/leaderboard", value: "Top 10 battlers ranked by wins and level.", inline: false },
          { name: "/autohunt", value: "Toggle auto-hunting. Battles chain instantly on win; stops on defeat.", inline: false },
          { name: "/items", value: "Browse all weapons, armor, potions, and buffs by category.", inline: false },
          { name: "/battlehelp", value: "Shows detailed battle help with buff potions and streak info.", inline: false },
        )
        .addFields(
          {
            name: "✨ **Buff Potions**",
            value: "**🍀 Luck Potion** — 3x drop rate for 3 battles\n**📈 XP Potion** — 3x XP for 3 battles\n**👾 Horde Potion** — Fight 3 enemies in one battle!\n**⚡ Elixir of Power** — +20 Attack for 3 battles\n**🍺 Berserker Brew** — +35 Attack, -10 Defense for 3 battles\n**✨ Divine Blessing** — All buffs active for 5 battles!",
            inline: false,
          },
          { name: "🔥 **Streak System**", value: "Win consecutively to build your streak. Higher streak = harder enemies but way better rewards (XP, coins, drops). Lose to reset.", inline: false },
        ),
  },
];

export async function execute(interaction: ChatInputCommandInteraction) {
  let pageIdx = 0;

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

  const reply = await interaction.reply({
    embeds: [PAGES[pageIdx].build()],
    components: [row],
    fetchReply: true,
  });

  const collector = reply.createMessageComponentCollector<ComponentType.Button>({
    filter: (i) => i.user.id === interaction.user.id,
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
    try { await interaction.editReply({ components: [] }); } catch {}
  });
}
