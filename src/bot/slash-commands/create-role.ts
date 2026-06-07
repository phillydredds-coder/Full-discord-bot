import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getOwnerRole, setOwnerRole } from "../storage.js";
import { STAT_REP_ROLE_NAME, LEVEL_ROLE_ID, COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("createrole")
  .setDescription("Create a custom role and assign it to yourself")
  .addStringOption((opt) => opt.setName("name").setDescription("Custom role name").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) return;

  const isEligible =
    member.roles.cache.some((r) => r.name === STAT_REP_ROLE_NAME) ||
    member.roles.cache.has(LEVEL_ROLE_ID);

  if (!isEligible) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ You must have the **Stat Rep** role or reach **level 10** to use this command."),
      ],
      ephemeral: true,
    });
    return;
  }

  const existingRoleId = getOwnerRole(guild.id, interaction.user.id);
  if (existingRoleId) {
    const existingRole = guild.roles.cache.get(existingRoleId);
    if (existingRole) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setDescription(
              `❌ You already own the role **${existingRole.name}**. Delete it first with "/deleterole".`
            ),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  const roleName = interaction.options.getString("name", true).trim();
  if (roleName.length > 100) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ Role name must be 100 characters or fewer."),
      ],
      ephemeral: true,
    });
    return;
  }

  try {
    const botMember = await guild.members.fetchMe();
    const botHighestPosition = botMember.roles.highest.position;

    const newRole = await guild.roles.create({
      name: roleName,
      reason: `Custom role created by ${interaction.user.tag}`,
    });

    await newRole.setPosition(botHighestPosition - 1);
    await member.roles.add(newRole);
    setOwnerRole(guild.id, interaction.user.id, newRole.id);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.SUCCESS)
          .setTitle("✅ Role Created")
          .setDescription(`Your custom role **${roleName}** has been created and assigned to you!`)
          .addFields({ name: "Commands", value: "/rolename /rolecolor /roleicon /deleterole" }),
      ],
    });
  } catch (error) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.ERROR)
          .setDescription("❌ Failed to create role. Make sure the bot has the **Manage Roles** permission."),
      ],
      ephemeral: true,
    });
  }
}
