import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";
import * as storage from "../storage.js";

export const name = "balance";
export const aliases = ["bal"];
export const usage = "balance";

export async function execute(message: Message, _args: string[]) {
  const guild = message.guild;
  if (!guild) return;

  const bal = storage.getBalance(guild.id, message.author.id);
  const cute = storage.getCuteCoins(guild.id, message.author.id);
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Glitter Balance")
    .setDescription(`${message.author}, here's your balance!`)
    .addFields(
      { name: "🪙 Coins", value: `**${bal}** coins`, inline: true },
      { name: "🩷 Cute Coins", value: `**${cute}** cute coins`, inline: true },
    );
  await message.reply({ embeds: [embed] });
}
