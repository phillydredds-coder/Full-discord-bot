import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("addupdate")
  .setDescription("Add a new version entry to the bot update log")
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
  .addStringOption((o) =>
    o.setName("version").setDescription("Version number (e.g. 1.2.0)").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("date").setDescription("Date string (e.g. June 10, 2026)").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("changes").setDescription("Pipe-separated list of changes (change 1 | change 2)").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  const member = interaction.member;
  if (!guild || !member || typeof member.permissions === "string" || !member.permissions.has("ManageGuild")) {
    await interaction.reply({ content: "❌ You need **Manage Server** permission to add updates.", ephemeral: true });
    return;
  }

  const version = interaction.options.getString("version", true);
  const date = interaction.options.getString("date", true);
  const changesRaw = interaction.options.getString("changes", true);

  const changes = changesRaw.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
  if (changes.length === 0) {
    await interaction.reply({ content: "❌ Please provide at least one change.", ephemeral: true });
    return;
  }

  storage.addChangelogEntry({ version, date, changes });

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ Added **v${version}** (${date}) to the update log with **${changes.length}** change${changes.length > 1 ? "s" : ""}.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
