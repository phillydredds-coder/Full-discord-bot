import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Guild, Role } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { SHOP_TIERS, getOrCreateTierRole, assignTierRole, sendReceipt, sendPurchaseDM } from "../shop-tiers.js";

export const data = new SlashCommandBuilder()
  .setName("economy")
  .setDescription("Earn coins, browse the baby pink shop, and buy glowing role tiers")
  .addSubcommand((s) => s.setName("balance").setDescription("Show how many glitter coins you have"))
  .addSubcommand((s) => s.setName("shop").setDescription("Show the baby pink role tier shop"))
  .addSubcommand((s) => s.setName("buy").setDescription("Buy a pastel role tier from the shop").addIntegerOption((o) => o.setName("tier").setDescription("Tier number").setRequired(true)));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;
  const userId = interaction.user.id;
  const sub = interaction.options.getSubcommand();

  if (sub === "balance") {
    const bal = storage.getBalance(guild.id, userId);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.PINK).setTitle("🩷 Coin Cutie Balance").setDescription(`You have **${bal}** glitter coins! ✨`)], ephemeral: true });
    return;
  }

  if (sub === "shop") {
    const embed = new EmbedBuilder().setColor(COLORS.PINK).setTitle("🎀 Baby Pink Shop").setDescription("Choose a dreamy role tier and sparkle with pastel power.");
    SHOP_TIERS.forEach((tier) => embed.addFields({ name: `${tier.label} — ${tier.price} coins`, value: tier.description, inline: false }));
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "buy") {
    const tier = interaction.options.getInteger("tier", true);
    const selected = SHOP_TIERS[tier - 1] ?? SHOP_TIERS[0];
    const bal = storage.getBalance(guild.id, userId);
    if (bal < selected.price) {
      await interaction.reply({ content: `You need ${selected.price} coins but only have ${bal}.`, ephemeral: true });
      return;
    }
    const roleName = `♡ ${selected.label}`;
    const existingRole = guild.roles.cache.find((r) => r.name === roleName);
    if (existingRole && interaction.member && "roles" in interaction.member) {
      const memberRoles = interaction.member.roles as import("discord.js").GuildMemberRoleManager;
      if (memberRoles.cache.has(existingRole.id)) {
        await interaction.reply({ content: `❌ You already own **${roleName}**! Each tier can only be purchased once.`, ephemeral: true });
        return;
      }
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const role = await assignTierRole(guild, userId, selected);
      storage.setOwnerRole(guild.id, userId, role.id);
      storage.addBalance(guild.id, userId, -selected.price);
      const now = Date.now();
      storage.addPurchase(guild.id, userId, { tier: selected.label, roleId: role.id, price: selected.price, timestamp: now });
      await sendReceipt(guild, userId, selected, role, now);
      const newBalance = storage.getBalance(guild.id, userId);
      await sendPurchaseDM(interaction.user, guild, selected, role, newBalance);
      await interaction.editReply({ content: `✅ You received the ${role.name} role and were charged ${selected.price} coins.` });
    } catch (err) {
      await interaction.editReply({ content: "❌ Failed to assign role. Make sure the bot has Manage Roles permission and its role is above the tier roles." });
    }
    return;
  }
}
