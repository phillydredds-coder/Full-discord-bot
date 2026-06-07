import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { SHOP_TIERS, assignTierRole, sendReceipt, sendPurchaseDM } from "../shop-tiers.js";

export const name = "shop";
export const aliases: string[] = [];
export const usage = "shop";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;
  const userId = message.author.id;

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Baby Pink Role Shop 🛍️")
    .setDescription("Buy magical pastel roles with real access perks. Each tier unlocks stronger permissions and more exclusive server privileges.");

  SHOP_TIERS.forEach((tier) => {
    embed.addFields({
      name: `${tier.label} — ${tier.price} coins`,
      value: `${tier.description} Role color: #${tier.color.toString(16).padStart(6, "0")}`,
      inline: false,
    });
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop_buy_tier1").setLabel("Buy Tier 1").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("shop_buy_tier2").setLabel("Buy Tier 2").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("shop_buy_tier3").setLabel("Buy Tier 3").setStyle(ButtonStyle.Primary),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("shop_buy_tier4").setLabel("Buy Tier 4 🌟").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("shop_buy_tier5").setLabel("Buy Tier 5 ✨").setStyle(ButtonStyle.Primary),
  );

  const sent = await message.reply({ embeds: [embed], components: [row, row2] });

  const collector = sent.createMessageComponentCollector({ time: 3_600_000 });
  collector.on("collect", async (i) => {
    if (i.user.id !== userId) {
      await i.reply({ content: "You can't buy for someone else.", ephemeral: true });
      return;
    }
    await i.deferUpdate();
    const id = i.customId;
    const tier = Number(id.split("_").pop()?.replace("tier", "")) || 1;
    const selected = SHOP_TIERS[tier - 1] ?? SHOP_TIERS[0];
    const roleName = `♡ ${selected.label}`;
    const existingRole = guild.roles.cache.find((r) => r.name === roleName);
    if (existingRole && i.member && "roles" in i.member) {
      const memberRoles = i.member.roles as import("discord.js").GuildMemberRoleManager;
      if (memberRoles.cache.has(existingRole.id)) {
        await i.followUp({ content: `❌ You already own **${roleName}**! Each tier can only be purchased once.`, ephemeral: true });
        return;
      }
    }
    const bal = storage.getBalance(guild.id, userId);
    if (bal < selected.price) {
      await i.followUp({ content: `You need ${selected.price} coins but only have ${bal}.`, ephemeral: true });
      return;
    }

    try {
      const role = await assignTierRole(guild, userId, selected);
      storage.setOwnerRole(guild.id, userId, role.id);
      storage.addBalance(guild.id, userId, -selected.price);
      const now = Date.now();
      storage.addPurchase(guild.id, userId, { tier: selected.label, roleId: role.id, price: selected.price, timestamp: now });
      await sendReceipt(guild, userId, selected, role, now);
      const newBalance = storage.getBalance(guild.id, userId);
      await sendPurchaseDM(message.author, guild, selected, role, newBalance);
      await i.followUp({ content: `✅ You received the ${role.name} role and were charged ${selected.price} coins.`, ephemeral: true });
    } catch (err) {
      await i.followUp({ content: "❌ Failed to assign role. Make sure the bot has Manage Roles permission and its role is above the tier roles.", ephemeral: true });
    }
  });

  collector.on("end", () => {});
}
