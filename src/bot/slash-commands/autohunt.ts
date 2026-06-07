import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { startAutoChain } from "../handlers/auto-battle.js";
import { requireTier3Access } from "../shop-tiers.js";

export const data = new SlashCommandBuilder()
  .setName("autohunt")
  .setDescription("Toggle auto-hunting on/off (chains battles on win, stops on loss)");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  // Use channel.send for the tier prompt so interaction.reply is still available for the final result
  const channel = interaction.channel as TextChannel | null;
  if (!channel) return;

  const ok = await requireTier3Access(
    guild,
    interaction.user.id,
    async (embed, components) => {
      const sent = await channel.send({ embeds: [embed], components: components ?? [] });
      return { message: sent };
    },
  );
  if (!ok) {
    if (!interaction.replied) {
      await interaction.reply({ content: "Check the channel for details.", ephemeral: true });
    }
    return;
  }

  const p = storage.getBattlePlayer(guild.id, interaction.user.id);

  if (p.autohunt) {
    p.autohunt = false;
    p.autoChannel = null;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);
    await interaction.reply("⏹️ **Autohunt disabled.** No more auto-battles.");
  } else {
    if (p.currentHp <= 0) {
      p.currentHp = p.maxHp;
    }
    p.autohunt = true;
    p.autoChannel = interaction.channel!.id;
    storage.saveBattlePlayer(guild.id, interaction.user.id, p);
    await interaction.reply("▶️ **Autohunt enabled!** Battles will chain immediately after each win. Stops on defeat. Toggle off with `/autohunt`.");
    startAutoChain(interaction.client, guild.id, interaction.user.id).catch((err) => console.error("[autohunt] Chain error:", err));
  }
}
