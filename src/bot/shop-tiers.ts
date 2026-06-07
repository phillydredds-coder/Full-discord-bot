import { PermissionsBitField, Guild, Role, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message, User } from "discord.js";
import { COLORS } from "./constants.js";
import * as storage from "./storage.js";

export interface TierInfo {
  price: number;
  label: string;
  color: number;
  permissions: bigint[];
  description: string;
  customRoleId?: string;
}

export const SHOP_TIERS: TierInfo[] = [
  {
    price: 100,
    label: "Tier 1",
    color: 0xffb6c1,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.UseExternalEmojis,
      PermissionsBitField.Flags.UseExternalStickers,
      PermissionsBitField.Flags.SendVoiceMessages,
    ],
    description: "Cute violet tier with basic chat, embeds, attachments, and external emojis/stickers.",
  },
  {
    price: 500,
    label: "Tier 2",
    color: 0xffc0cb,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.UseExternalEmojis,
      PermissionsBitField.Flags.UseExternalStickers,
      PermissionsBitField.Flags.SendVoiceMessages,
      PermissionsBitField.Flags.UseApplicationCommands,
      PermissionsBitField.Flags.CreatePublicThreads,
      PermissionsBitField.Flags.CreatePrivateThreads,
      PermissionsBitField.Flags.SendMessagesInThreads,
      PermissionsBitField.Flags.SendPolls,
    ],
    description: "Pretty pastel tier adding bot commands, polls, and thread access.",
  },
  {
    price: 1500,
    label: "Tier 3",
    color: 0xffd6e8,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.UseExternalEmojis,
      PermissionsBitField.Flags.UseExternalStickers,
      PermissionsBitField.Flags.SendVoiceMessages,
      PermissionsBitField.Flags.UseApplicationCommands,
      PermissionsBitField.Flags.CreatePublicThreads,
      PermissionsBitField.Flags.CreatePrivateThreads,
      PermissionsBitField.Flags.SendMessagesInThreads,
      PermissionsBitField.Flags.SendPolls,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.Stream,
      PermissionsBitField.Flags.UseVAD,
      PermissionsBitField.Flags.UseSoundboard,
      PermissionsBitField.Flags.RequestToSpeak,
    ],
    description: "VIP tier granting access to custom role creation commands! Create, name, color, icon, and share your own roles.",
    customRoleId: "1512591214640234619",
  },
  {
    price: 4000,
    label: "Tier 4",
    color: 0xffa3c4,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.UseExternalEmojis,
      PermissionsBitField.Flags.UseExternalStickers,
      PermissionsBitField.Flags.SendVoiceMessages,
      PermissionsBitField.Flags.UseApplicationCommands,
      PermissionsBitField.Flags.CreatePublicThreads,
      PermissionsBitField.Flags.CreatePrivateThreads,
      PermissionsBitField.Flags.SendMessagesInThreads,
      PermissionsBitField.Flags.SendPolls,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.Stream,
      PermissionsBitField.Flags.UseVAD,
      PermissionsBitField.Flags.UseSoundboard,
      PermissionsBitField.Flags.RequestToSpeak,
      PermissionsBitField.Flags.CreateInstantInvite,
      PermissionsBitField.Flags.CreateEvents,
      PermissionsBitField.Flags.UseEmbeddedActivities,
      PermissionsBitField.Flags.ChangeNickname,
    ],
    description: "Exclusive tier with invites, events, voice activities, and nickname changes.",
  },
  {
    price: 10000,
    label: "Tier 5",
    color: 0xf8bbd0,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.EmbedLinks,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.UseExternalEmojis,
      PermissionsBitField.Flags.UseExternalStickers,
      PermissionsBitField.Flags.SendVoiceMessages,
      PermissionsBitField.Flags.UseApplicationCommands,
      PermissionsBitField.Flags.CreatePublicThreads,
      PermissionsBitField.Flags.CreatePrivateThreads,
      PermissionsBitField.Flags.SendMessagesInThreads,
      PermissionsBitField.Flags.SendPolls,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.Stream,
      PermissionsBitField.Flags.UseVAD,
      PermissionsBitField.Flags.UseSoundboard,
      PermissionsBitField.Flags.RequestToSpeak,
      PermissionsBitField.Flags.CreateInstantInvite,
      PermissionsBitField.Flags.CreateEvents,
      PermissionsBitField.Flags.ChangeNickname,
      PermissionsBitField.Flags.PrioritySpeaker,
      PermissionsBitField.Flags.UseExternalSounds,
      PermissionsBitField.Flags.SendTTSMessages,
    ],
    description: "Ultimate premium tier with priority speaker, external sounds, and TTS.",
  },
];

const RECEIPT_CHANNEL_ID = "1512137267182047246";

export async function getOrCreateTierRole(guild: Guild, tier: TierInfo): Promise<Role> {
  const roleName = `♡ ${tier.label}`;
  let role = guild.roles.cache.find((r) => r.name === roleName);
  if (role) {
    if (!role.hoist) await role.setHoist(true, `Updated ${tier.label} role to display separately`);
    return role;
  }
  role = await guild.roles.create({
    name: roleName,
    color: tier.color,
    permissions: tier.permissions,
    hoist: true,
    reason: `Auto-created ${tier.label} shop role`,
  });
  return role;
}

export async function assignTierRole(guild: Guild, userId: string, tier: TierInfo): Promise<Role> {
  const role = await getOrCreateTierRole(guild, tier);
  const member = await guild.members.fetch(userId);
  if (!member.roles.cache.has(role.id)) {
    await member.roles.add(role, `Purchased ${tier.label} from shop`);
  }
  // Also assign any custom linked role (e.g. custom role creation role)
  if (tier.customRoleId) {
    const customRole = guild.roles.cache.get(tier.customRoleId);
    if (customRole && !member.roles.cache.has(customRole.id)) {
      await member.roles.add(customRole, `Bonus role for ${tier.label}`);
    }
  }
  return role;
}

export async function sendReceipt(guild: Guild, userId: string, tier: TierInfo, role: Role, timestamp: number) {
  const channel = guild.channels.cache.get(RECEIPT_CHANNEL_ID) as TextChannel | undefined;
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🧾 Receipt")
    .setDescription(`<@${userId}> purchased **♡ ${tier.label}**`)
    .addFields(
      { name: "Tier", value: tier.label, inline: true },
      { name: "Price", value: `${tier.price} coins`, inline: true },
      { name: "Role", value: `${role}`, inline: true },
      { name: "Time", value: `<t:${Math.floor(timestamp / 1000)}:F>`, inline: false },
    )
    .setTimestamp(timestamp);

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`refund_${guild.id}_${userId}_${timestamp}`)
      .setLabel("Refund (24h)")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("↩️"),
  );

  await channel.send({ embeds: [embed], components: [button] });
}

const TIER3 = SHOP_TIERS[2]; // Tier 3 = 1500 coins

const PERMISSION_LABELS: Record<string, string> = {
  ViewChannel: "View channels",
  SendMessages: "Send messages",
  ReadMessageHistory: "Read message history",
  EmbedLinks: "Embed links",
  AttachFiles: "Attach files",
  AddReactions: "Add reactions",
  UseExternalEmojis: "Use external emojis",
  UseExternalStickers: "Use external stickers",
  SendVoiceMessages: "Send voice messages",
  UseApplicationCommands: "Use slash commands",
  CreatePublicThreads: "Create public threads",
  CreatePrivateThreads: "Create private threads",
  SendMessagesInThreads: "Send messages in threads",
  SendPolls: "Send polls",
  Connect: "Connect to voice",
  Speak: "Speak in voice",
  Stream: "Go live / stream",
  UseVAD: "Use voice activity",
  UseSoundboard: "Use soundboard",
  RequestToSpeak: "Request to speak in stage",
  CreateInstantInvite: "Create invites",
  CreateEvents: "Create events",
  UseEmbeddedActivities: "Use voice activities",
  ChangeNickname: "Change nickname",
  PrioritySpeaker: "Priority speaker",
  UseExternalSounds: "Use external sounds",
  SendTTSMessages: "Send TTS messages",
};

function formatPermissions(perms: bigint[]): string {
  return perms
    .map((flag) => {
      const entry = Object.entries(PermissionsBitField.Flags).find(([, v]) => v === flag);
      return entry ? PERMISSION_LABELS[entry[0]] ?? entry[0] : null;
    })
    .filter(Boolean)
    .join("\n");
}

export async function sendPurchaseDM(user: User, guild: Guild, tier: TierInfo, role: Role, newBalance: number) {
  try {
    const roleList = [`<@&${role.id}>`];
    if (tier.customRoleId) {
      const customRole = guild.roles.cache.get(tier.customRoleId);
      if (customRole) roleList.push(`<@&${customRole.id}>`);
    }

    const embed = new EmbedBuilder()
      .setColor(0xffb6c1)
      .setTitle("🩷 Thank You for Your Purchase!")
      .setDescription(`You purchased **♡ ${tier.label}** in **${guild.name}**!`)
      .addFields(
        { name: "🎀 Roles Granted", value: roleList.join("\n"), inline: false },
        { name: "💰 Remaining Balance", value: `${newBalance} coins`, inline: false },
        { name: "✨ Permissions Unlocked", value: formatPermissions(tier.permissions), inline: false },
      )
      .setFooter({ text: "discord.gg/bbydollz" });
    await user.send({ embeds: [embed] }).catch(() => {});
  } catch {}
}

/** Check if a user has ♡ Tier 3+ role. If not, prompt them to buy it or show the shortfall.
 *  Returns true if they can proceed (already has role or just bought it).
 *  `sendPrompt` sends an embed (with optional buttons) and returns the sent Message (for collector). */
export async function requireTier3Access(
  guild: Guild,
  userId: string,
  sendPrompt: (embed: EmbedBuilder, components?: ActionRowBuilder<ButtonBuilder>[]) => Promise<{ message: Message }>,
): Promise<boolean> {
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return false;

  const tier3RoleId = TIER3.customRoleId;
  const tierRoleNames = ["♡ Tier 3", "♡ Tier 4", "♡ Tier 5"];
  const hasTier = member.roles.cache.some((r) => tierRoleNames.includes(r.name) || (tier3RoleId && r.id === tier3RoleId));
  if (hasTier) return true;

  const bal = storage.getBalance(guild.id, userId);
  if (bal >= TIER3.price) {
    const promptEmbed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle("♡ Tier 3 Required")
      .setDescription(`**Autohunt** requires the **♡ Tier 3** role (${TIER3.price} coins).\nYou have **${bal}** coins — enough to buy it!`)
      .addFields({ name: "Tier 3 Perks", value: "Custom role creation — create, name, color, and share your own roles!" });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("tier3_buy").setLabel(`Buy ♡ Tier 3 (${TIER3.price} coins)`).setStyle(ButtonStyle.Primary).setEmoji("🛍️"),
      new ButtonBuilder().setCustomId("tier3_cancel").setLabel("No thanks").setStyle(ButtonStyle.Secondary),
    );

    const { message: sent } = await sendPrompt(promptEmbed, [row]);

    return new Promise((resolve) => {
      const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, max: 1 });
      collector.on("collect", async (i) => {
        if (i.user.id !== userId) {
          await i.reply({ content: "These buttons aren't for you.", ephemeral: true });
          return;
        }
        if (i.customId === "tier3_buy") {
          await i.deferUpdate();
          try {
            const role = await assignTierRole(guild, userId, TIER3);
            storage.setOwnerRole(guild.id, userId, role.id);
            storage.addBalance(guild.id, userId, -TIER3.price);
            const now = Date.now();
            storage.addPurchase(guild.id, userId, { tier: TIER3.label, roleId: role.id, price: TIER3.price, timestamp: now });
            await sendReceipt(guild, userId, TIER3, role, now);
            const newBalance = storage.getBalance(guild.id, userId);
            const buyer = await guild.client.users.fetch(userId).catch(() => null);
            if (buyer) await sendPurchaseDM(buyer, guild, TIER3, role, newBalance);
            await i.followUp({ content: "✅ **♡ Tier 3** purchased! You now have access to autohunt.", ephemeral: true });
            resolve(true);
          } catch {
            await i.followUp({ content: "❌ Failed to assign role. Make sure the bot has Manage Roles permission.", ephemeral: true });
            resolve(false);
          }
        } else {
          await i.deferUpdate();
          await i.followUp({ content: "Autohunt requires ♡ Tier 3. You can buy it anytime from `,shop`.", ephemeral: true });
          resolve(false);
        }
      });
      collector.on("end", () => resolve(false));
    });
  }

  const shortfall = TIER3.price - bal;
  const shortfallEmbed = new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle("♡ Tier 3 Required")
    .setDescription(`**Autohunt** requires the **♡ Tier 3** role (${TIER3.price} coins).\nYou only have **${bal}** coins. You need **${shortfall}** more coins to buy it.\n\nEarn coins by chatting or battling! (\`,balance\` to check, \`,battle\` to fight!)`)
    .addFields({ name: "Tier 3 Perks", value: "Custom role creation — create, name, color, and share your own roles!" });

  await sendPrompt(shortfallEmbed);
  return false;
}
