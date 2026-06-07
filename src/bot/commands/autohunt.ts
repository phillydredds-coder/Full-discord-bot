import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";
import { startAutoChain } from "../handlers/auto-battle.js";
import { requireTier3Access } from "../shop-tiers.js";

export const name = "autohunt";
export const aliases = ["ah", "autobattle", "ab"];
export const usage = "autohunt";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const ok = await requireTier3Access(
    guild,
    message.author.id,
    async (embed, components) => {
      const sent = await message.reply({ embeds: [embed], components: components ?? [] });
      return { message: sent };
    },
  );
  if (!ok) return;

  const p = storage.getBattlePlayer(guild.id, message.author.id);

  if (p.autohunt) {
    p.autohunt = false;
    p.autoChannel = null;
    storage.saveBattlePlayer(guild.id, message.author.id, p);
    await message.reply("⏹️ **Autohunt disabled.** No more auto-battles.");
  } else {
    if (p.currentHp <= 0) {
      p.currentHp = p.maxHp;
    }
    p.autohunt = true;
    p.autoChannel = message.channel.id;
    storage.saveBattlePlayer(guild.id, message.author.id, p);
    await message.reply("▶️ **Autohunt enabled!** Battles will chain immediately after each win. Stops on defeat. Toggle off with `,ah`.");
    startAutoChain(message.client, guild.id, message.author.id).catch((err) => console.error("[autohunt] Chain error:", err));
  }
}
