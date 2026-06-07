import { Message, EmbedBuilder } from "discord.js";
import { COLORS, PREFIX } from "../constants.js";

export const name = "role-help";
export const aliases = ["rh"];
export const usage = "role-help";

export async function execute(message: Message, _args: string[]) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Custom Role Commands")
    .setDescription(
      `Create and customize your own server role. Only the role owner can modify or delete it.`
    )
    .addFields(
      {
        name: `\`${PREFIX}create-role <name>\` (\`${PREFIX}cr\`)`,
        value: "Creates your personal custom role and assigns it to you.",
      },
      {
        name: `\`${PREFIX}role-name <name>\` (\`${PREFIX}rn\`)`,
        value: "Renames your custom role.",
      },
      {
        name: `\`${PREFIX}role-color <#RRGGBB>\` (\`${PREFIX}rc\`)`,
        value: "Changes your role color using a HEX code (e.g. `#FFCFE6`).",
      },
      {
        name: `\`${PREFIX}role-icon <emoji>\` (\`${PREFIX}ri\`)`,
        value: "Sets a server emoji as your role icon. Requires Server Boost Level 2.",
      },
      {
        name: `\`${PREFIX}role-info <@role>\` (\`${PREFIX}rinfo\`)`,
        value: "Shows detailed info about a role (color, icon, permissions, members).",
      },
      {
        name: `\`${PREFIX}share-role @user\` (\`${PREFIX}sr\`)`,
        value: "Sends the mentioned user a prompt to accept your custom role.",
      },
      {
        name: `\`${PREFIX}delete-role\` (\`${PREFIX}dr\`)`,
        value: "Permanently deletes your custom role from the server.",
      },
      {
        name: `\`${PREFIX}reaction-role\` (\`${PREFIX}rr\`)`,
        value: "Opens a role menu to pick pronoun, gender, and ping roles.",
      },
    );

  await message.reply({ embeds: [embed] });
}
