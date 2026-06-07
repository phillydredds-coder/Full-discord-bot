import { Message, EmbedBuilder } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";
import * as storage from "../storage.js";

export const name = "addupdate";
export const aliases = ["newupdate", "addversion"];
export const usage = "addupdate <version> <date> | <change1> | <change2> | ...";

export async function execute(message: Message, args: string[]) {
  const guild = message.guild;
  const member = message.member;
  if (!guild || !member) return;

  if (!member.permissions.has("ManageGuild")) {
    await message.reply("❌ You need **Manage Server** permission to add updates.");
    return;
  }

  const raw = message.content.slice(PREFIX.length).trim();
  const parts = raw.split("|").map((s) => s.trim());
  // parts[0] = "addupdate 1.2.0 June 10, 2026"
  // parts[1..] = changes

  if (parts.length < 2) {
    await message.reply(
      `Usage: \`${PREFIX}addupdate <version> <date> | <change1> | <change2> | ...\`\n` +
      `Example: \`${PREFIX}addupdate 1.2.0 June 10, 2026 | Added new feature | Fixed a bug\``
    );
    return;
  }

  const header = parts[0];
  const headerParts = header.split(/\s+/);
  // headerParts[0] = "addupdate" (or alias), headerParts[1] = version, rest = date
  const version = headerParts[1];
  const date = headerParts.slice(2).join(" ");

  if (!version || !date) {
    await message.reply("❌ Please provide both a version and date. Example: `1.2.0 June 10, 2026`");
    return;
  }

  const changes = parts.slice(1).filter((c) => c.length > 0);
  if (changes.length === 0) {
    await message.reply("❌ Please provide at least one change.");
    return;
  }

  storage.addChangelogEntry({ version, date, changes });

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ Added **v${version}** (${date}) to the update log with **${changes.length}** change${changes.length > 1 ? "s" : ""}.`);

  await message.reply({ embeds: [embed] });
}
