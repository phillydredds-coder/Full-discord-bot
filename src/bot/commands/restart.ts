import { Message, EmbedBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const name = "restart";
export const aliases = ["reboot"];
export const usage = "restart";

export async function execute(message: Message, _args: string[]) {
  const BOT_CREATOR = process.env["BOT_CREATOR_ID"];
  if (!BOT_CREATOR) {
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ BOT_CREATOR_ID is not configured on the process. Set this env var to restrict restart to the bot creator.")] });
    return;
  }

  if (message.author.id !== BOT_CREATOR) {
    await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.ERROR).setDescription("❌ Only the bot creator can restart me.")] });
    return;
  }

  await message.reply({ embeds: [new EmbedBuilder().setColor(COLORS.INFO).setDescription("🔄 Restarting... Goodbye.")] });
  // Give the message a moment to send, then exit so external process manager can restart
  setTimeout(() => process.exit(0), 1000);
}
