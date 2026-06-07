import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  GuildMember,
  TextChannel,
} from "discord.js";
import { COLORS } from "../constants.js";

export const name = "reaction-role";
export const aliases = ["rr", "reaction-roles"];
export const usage = "reaction-role";

const TARGET_CHANNEL_ID = "1512137260886396960";
const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const excludedNames = ["helper", "detailer", "detailers", "customer"];
const pronounRegex = /\b(he\/?him|she\/?her|they\/?them|any pronoun|all pronouns|xe\/?xem|ze\/?zir|e\/?em|ve\/?ver|fae|spivak|theythem|sheher|hehim)\b/i;
const ageRegex = /\b(18\+|21\+|16\+|adult|minor|teen|age|years old|yr old|old)\b/i;

function isExcludedRole(roleName: string) {
  const normalized = roleName.toLowerCase();
  return excludedNames.some((excluded) => normalized.includes(excluded));
}

function buildSelectMenu(customId: string, roles: Array<ReturnType<typeof roleIdToOption>>) {
  return new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder("Select one or more roles, then submit")
    .setMinValues(0)
    .setMaxValues(roles.length)
    .addOptions(roles);
}

function roleIdToOption(role: { id: string; name: string }) {
  return {
    label: role.name.slice(0, 100),
    value: role.id,
    description: role.name.length > 60 ? role.name.slice(0, 50) : undefined,
  };
}

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const targetChannel = guild.channels.cache.get(TARGET_CHANNEL_ID);
  if (!targetChannel || !(targetChannel instanceof TextChannel)) {
    await message.reply(
      `❌ I couldn't find the target text channel <#${TARGET_CHANNEL_ID}> in this server.`
    );
    return;
  }

  const botMember = guild.members.me ?? (await guild.members.fetchMe());
  const allManageableRoles = guild.roles.cache
    .filter((role) =>
      !role.managed &&
      role.id !== guild.id &&
      botMember.roles.highest.comparePositionTo(role) > 0 &&
      !isExcludedRole(role.name)
    )
    .sort((a, b) => b.position - a.position)
    .first(25);

  if (!allManageableRoles.length) {
    await message.reply(
      "❌ I couldn't find any roles that I can manage in this server."
    );
    return;
  }

  const pronounRoles = allManageableRoles.filter((role) => pronounRegex.test(role.name));
  const ageRoles = allManageableRoles.filter((role) => ageRegex.test(role.name));
  const stageOneRoles = pronounRoles.length ? pronounRoles : allManageableRoles;
  const stageTwoRoles = ageRoles.length ? ageRoles : [];

  const pronounOptions = stageOneRoles.map(roleIdToOption);
  const pronounMenuId = `reaction_role_pronouns_${Date.now()}`;
  const pronounRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    buildSelectMenu(pronounMenuId, pronounOptions)
  );

  const stageOneEmbed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle("Pronoun Roles")
    .setDescription(
      stageOneRoles.length
        ? "Select your pronoun role(s) and submit. Age roles will appear next."
        : "No pronoun roles were found."
    )
    .setFooter({ text: "Stage 1: pronouns" });

  const postedMessage = await targetChannel.send({
    embeds: [stageOneEmbed],
    components: [pronounRow],
  });

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setDescription(
          `✅ Reaction role selector posted in <#${TARGET_CHANNEL_ID}>. Start with pronoun roles.`
        ),
    ],
  });

  const pronounCollector = postedMessage.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: TIMEOUT_MS,
    filter: (interaction) =>
      !interaction.user.bot && interaction.customId === pronounMenuId,
    max: 1,
  });

  pronounCollector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    let member: GuildMember;
    if (interaction.member instanceof GuildMember) {
      member = interaction.member;
    } else {
      try {
        member = await guild.members.fetch(interaction.user.id);
      } catch {
        await interaction.editReply({
          content: "❌ I couldn't load your member data.",
        });
        return;
      }
    }

    const selectedPronouns = new Set(interaction.values);
    const pronounRolesToAdd = stageOneRoles.filter(
      (role) => selectedPronouns.has(role.id) && !member.roles.cache.has(role.id)
    );
    const pronounRolesToRemove = stageOneRoles.filter(
      (role) => !selectedPronouns.has(role.id) && member.roles.cache.has(role.id)
    );

    const pronounResults = [];
    try {
      if (pronounRolesToAdd.length) {
        await member.roles.add(pronounRolesToAdd.map((role) => role.id));
        pronounResults.push(
          `✅ Added pronoun roles: ${pronounRolesToAdd
            .map((role) => `**${role.name}**`)
            .join(", ")}`
        );
      }
      if (pronounRolesToRemove.length) {
        await member.roles.remove(pronounRolesToRemove.map((role) => role.id));
        pronounResults.push(
          `❌ Removed pronoun roles: ${pronounRolesToRemove
            .map((role) => `**${role.name}**`)
            .join(", ")}`
        );
      }
      if (!pronounResults.length) {
        pronounResults.push("ℹ️ No pronoun role changes were needed.");
      }
    } catch (error) {
      console.error("reaction-role pronoun update failed:", error);
      await interaction.editReply({
        content:
          "❌ I couldn't update your pronoun roles. Please check my role permissions.",
      });
      return;
    }

    await interaction.editReply({ content: pronounResults.join("\n") });

    if (!stageTwoRoles.length) {
      await postedMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle("Pronoun roles updated")
            .setDescription(
              "Your pronoun roles were updated. No age roles are configured for this server."
            )
            .setFooter({ text: "Selection complete." }),
        ],
        components: [],
      }).catch(() => {});
      return;
    }

    const ageOptions = stageTwoRoles.map(roleIdToOption);
    const ageMenuId = `reaction_role_age_${Date.now()}`;
    const ageRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      buildSelectMenu(ageMenuId, ageOptions)
    );

    const ageEmbed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle("Age Roles")
      .setDescription("Select your age role(s) and submit.")
      .setFooter({ text: "Stage 2: age roles" });

    await postedMessage.edit({
      embeds: [ageEmbed],
      components: [ageRow],
    });

    const ageCollector = postedMessage.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: TIMEOUT_MS,
      filter: (interaction) =>
        !interaction.user.bot && interaction.customId === ageMenuId,
      max: 1,
    });

    ageCollector.on("collect", async (ageInteraction) => {
      await ageInteraction.deferReply({ ephemeral: true });

      let ageMember: GuildMember;
      if (ageInteraction.member instanceof GuildMember) {
        ageMember = ageInteraction.member;
      } else {
        try {
          ageMember = await guild.members.fetch(ageInteraction.user.id);
        } catch {
          await ageInteraction.editReply({
            content: "❌ I couldn't load your member data.",
          });
          return;
        }
      }

      const selectedAges = new Set(ageInteraction.values);
      const ageRolesToAdd = stageTwoRoles.filter(
        (role) => selectedAges.has(role.id) && !ageMember.roles.cache.has(role.id)
      );
      const ageRolesToRemove = stageTwoRoles.filter(
        (role) => !selectedAges.has(role.id) && ageMember.roles.cache.has(role.id)
      );

      const ageResults = [];
      try {
        if (ageRolesToAdd.length) {
          await ageMember.roles.add(ageRolesToAdd.map((role) => role.id));
          ageResults.push(
            `✅ Added age roles: ${ageRolesToAdd
              .map((role) => `**${role.name}**`)
              .join(", ")}`
          );
        }
        if (ageRolesToRemove.length) {
          await ageMember.roles.remove(ageRolesToRemove.map((role) => role.id));
          ageResults.push(
            `❌ Removed age roles: ${ageRolesToRemove
              .map((role) => `**${role.name}**`)
              .join(", ")}`
          );
        }
        if (!ageResults.length) {
          ageResults.push("ℹ️ No age role changes were needed.");
        }
      } catch (error) {
        console.error("reaction-role age update failed:", error);
        await ageInteraction.editReply({
          content:
            "❌ I couldn't update your age roles. Please check my role permissions.",
        });
        return;
      }

      await ageInteraction.editReply({ content: ageResults.join("\n") });
      await postedMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle("Role selection complete")
            .setDescription(
              "Your pronoun and age roles were updated successfully."
            )
            .setFooter({ text: "Selection complete." }),
        ],
        components: [],
      }).catch(() => {});
    });

    ageCollector.on("end", async (collected) => {
      if (collected.size === 0) {
        await postedMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.ERROR)
              .setTitle("Age selection expired")
              .setDescription(
                "The age role selection expired before you submitted a choice."
              )
              .setFooter({ text: "Selection expired." }),
          ],
          components: [],
        }).catch(() => {});
      }
    });
  });

  pronounCollector.on("end", async (collected) => {
    if (collected.size === 0) {
      await postedMessage.edit({
        embeds: [
          EmbedBuilder.from(stageOneEmbed).setFooter({
            text: "This reaction role selector has expired.",
          }),
        ],
        components: [],
      }).catch(() => {});
    }
  });
}
