import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  GuildMember,
} from "discord.js";
import { COLORS } from "../constants.js";

const TARGET_CHANNEL_ID = "1512137260886396960";
const TIMEOUT_MS = 15 * 60 * 1000;
const excludedNames = ["helper", "detailer", "detailers", "customer"];
const pronounRegex = /\b(he\/?him|she\/?her|they\/?them|any pronoun|all pronouns|xe\/?xem|ze\/?zir|e\/?em|ve\/?ver|fae|spivak|theythem|sheher|hehim)\b/i;
const ageRegex = /\b(18\+|21\+|16\+|adult|minor|teen|age|years old|yr old|old)\b/i;

function isExcludedRole(roleName: string) {
  const normalized = roleName.toLowerCase();
  return excludedNames.some((excluded) => normalized.includes(excluded));
}

function roleToOption(role: { id: string; name: string }) {
  return {
    label: role.name.slice(0, 100),
    value: role.id,
    description: role.name.length > 60 ? role.name.slice(0, 50) : undefined,
  };
}

function buildMenu(customId: string, options: any[]) {
  return new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder("Select role(s) then submit")
    .setMinValues(0)
    .setMaxValues(options.length)
    .addOptions(options);
}

export const data = new SlashCommandBuilder()
.setName("reactionrole")
  .setDescription("Create a multi-select role menu in the configured channel");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const targetChannel = guild.channels.cache.get(TARGET_CHANNEL_ID);
  if (!targetChannel || !targetChannel.isTextBased()) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription(`❌ I couldn't find the target channel <#${TARGET_CHANNEL_ID}>.`)], ephemeral: true });
    return;
  }

  const botMember = guild.members.me ?? (await guild.members.fetchMe());
  const manageableRoles = guild.roles.cache
    .filter((role) => !role.managed && role.id !== guild.id && botMember.roles.highest.comparePositionTo(role) > 0 && !isExcludedRole(role.name))
    .sort((a, b) => b.position - a.position)
    .first(25);

  const pronounRoles = manageableRoles.filter((role) => pronounRegex.test(role.name));
  const ageRoles = manageableRoles.filter((role) => ageRegex.test(role.name));
  const stageOneRoles = pronounRoles.length ? pronounRoles : manageableRoles;

  if (!stageOneRoles.length) {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ No available pronoun roles were found for the menu.")], ephemeral: true });
    return;
  }

  const menuId = `reaction_role_pronouns_${Date.now()}`;
  const menu = buildMenu(menuId, stageOneRoles.map(roleToOption));
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle("Pronoun Roles")
    .setDescription("Select your pronoun role(s) and submit. Age roles will appear next.")
    .setFooter({ text: "Stage 1: pronouns" });

  const posted = await targetChannel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ Reaction role selector posted in <#${TARGET_CHANNEL_ID}>.`)], ephemeral: true });

  const collector = posted.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: TIMEOUT_MS,
    filter: (i) => !i.user.bot && i.customId === menuId,
    max: 1,
  });

  collector.on("collect", async (i) => {
    await i.deferReply({ ephemeral: true });
    const member = i.member instanceof GuildMember ? i.member : await guild.members.fetch(i.user.id).catch(() => null);
    if (!member) {
      await i.editReply({ content: "❌ Could not fetch your member data." });
      return;
    }

    const selected = new Set(i.values);
    const rolesToAdd = stageOneRoles.filter((role) => selected.has(role.id) && !member.roles.cache.has(role.id));
    const rolesToRemove = stageOneRoles.filter((role) => !selected.has(role.id) && member.roles.cache.has(role.id));

    try {
      if (rolesToAdd.length) await member.roles.add(rolesToAdd.map((role) => role.id));
      if (rolesToRemove.length) await member.roles.remove(rolesToRemove.map((role) => role.id));
      await i.editReply({ content: rolesToAdd.length || rolesToRemove.length ? `✅ Updated pronoun roles.` : `ℹ️ No pronoun role changes were needed.` });
    } catch (error) {
      await i.editReply({ content: "❌ Failed to update your pronoun roles. Check my permissions." });
      return;
    }

    if (!ageRoles.length) {
      await posted.edit({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("Role selection complete").setDescription("Your pronoun roles were updated. No age roles are configured.")], components: [] }).catch(() => {});
      return;
    }

    const ageMenuId = `reaction_role_age_${Date.now()}`;
    const ageMenu = buildMenu(ageMenuId, ageRoles.map(roleToOption));
    const ageRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(ageMenu);
    const ageEmbed = new EmbedBuilder().setColor(COLORS.INFO).setTitle("Age Roles").setDescription("Select your age role(s) and submit.").setFooter({ text: "Stage 2: age roles" });
    await posted.edit({ embeds: [ageEmbed], components: [ageRow] });

    const ageCollector = posted.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: TIMEOUT_MS,
      filter: (a) => !a.user.bot && a.customId === ageMenuId,
      max: 1,
    });

    ageCollector.on("collect", async (ageInteraction) => {
      await ageInteraction.deferReply({ ephemeral: true });
      const ageMember = ageInteraction.member instanceof GuildMember ? ageInteraction.member : await guild.members.fetch(ageInteraction.user.id).catch(() => null);
      if (!ageMember) {
        await ageInteraction.editReply({ content: "❌ Could not fetch your member data." });
        return;
      }

      const ageSelected = new Set(ageInteraction.values);
      const ageToAdd = ageRoles.filter((role) => ageSelected.has(role.id) && !ageMember.roles.cache.has(role.id));
      const ageToRemove = ageRoles.filter((role) => !ageSelected.has(role.id) && ageMember.roles.cache.has(role.id));

      try {
        if (ageToAdd.length) await ageMember.roles.add(ageToAdd.map((role) => role.id));
        if (ageToRemove.length) await ageMember.roles.remove(ageToRemove.map((role) => role.id));
        await ageInteraction.editReply({ content: ageToAdd.length || ageToRemove.length ? `✅ Updated age roles.` : `ℹ️ No age role changes were needed.` });
      } catch (error) {
        await ageInteraction.editReply({ content: "❌ Failed to update your age roles. Check my permissions." });
        return;
      }

      await posted.edit({ embeds: [new EmbedBuilder().setColor(COLORS.SUCCESS).setTitle("Role selection complete").setDescription("Your roles were updated successfully.")], components: [] }).catch(() => {});
    });

    ageCollector.on("end", async (collected) => {
      if (collected.size === 0) {
        await posted.edit({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setTitle("Age selection expired").setDescription("The age role selection expired before you submitted a choice.")], components: [] }).catch(() => {});
      }
    });
  });

  collector.on("end", async (collected) => {
    if (collected.size === 0) {
      await posted.edit({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("This reaction role selector has expired.")], components: [] }).catch(() => {});
    }
  });
}
