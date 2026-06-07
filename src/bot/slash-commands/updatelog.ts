import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import type { ChangelogEntry } from "../storage.js";

export const data = new SlashCommandBuilder()
  .setName("updatelog")
  .setDescription("See what's new in the latest bot updates");

const MAX_FIELD_LENGTH = 1024;
const MAX_EMBED_SIZE = 6000;

function chunkChanges(changes: string[]): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const c of changes) {
    const line = `• ${c}`;
    if (current.length + line.length + 1 > MAX_FIELD_LENGTH) {
      chunks.push(current);
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function buildEmbeds(versions: ChangelogEntry[]): EmbedBuilder[] {
  return versions.map((v) => {
    const chunks = chunkChanges(v.changes);
    const embed = new EmbedBuilder()
      .setColor(COLORS.PINK)
      .setTitle(`🩷 Bot Update — v${v.version}`)
      .setDescription(v.date);

    for (let i = 0; i < chunks.length; i++) {
      embed.addFields({
        name: i === 0 ? "✨ Changes" : `${v.version} (cont.)`,
        value: chunks[i],
      });
    }

    return embed;
  });
}

function estimateSize(embed: EmbedBuilder): number {
  const d = embed.data;
  let size = 0;
  if (d.title) size += d.title.length;
  if (d.description) size += d.description.length;
  if (d.footer?.text) size += d.footer.text.length;
  if (d.author?.name) size += d.author.name.length;
  for (const f of d.fields ?? []) size += f.name.length + f.value.length;
  return size;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const versions = storage.getChangelog();

  if (versions.length === 0) {
    await interaction.reply("No updates recorded yet.");
    return;
  }

  const allEmbeds = buildEmbeds(versions);
  const batches: EmbedBuilder[][] = [];
  let batch: EmbedBuilder[] = [];
  let batchSize = 0;

  for (const e of allEmbeds) {
    const size = estimateSize(e);
    if (batchSize + size > MAX_EMBED_SIZE && batch.length > 0) {
      batches.push(batch);
      batch = [e];
      batchSize = size;
    } else {
      batch.push(e);
      batchSize += size;
    }
  }
  if (batch.length > 0) batches.push(batch);

  await interaction.reply({ embeds: batches[0] });
  for (let i = 1; i < batches.length; i++) {
    await interaction.followUp({ embeds: batches[i] });
  }
}
