import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { COLORS } from "../constants.js";

export const data = new SlashCommandBuilder()
  .setName("rolehelp")
  .setDescription("Show custom role commands");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PINK)
    .setTitle("🩷 Custom Role Commands")
    .setDescription("Create and customize your own server role. Only the role owner can modify or delete it.")
    .addFields(
      { name: "/createrole <name>", value: "Creates your personal custom role and assigns it to you." },
      { name: "/rolename <name>", value: "Renames your custom role." },
      { name: "/rolecolor <#RRGGBB>", value: "Changes your role color with a HEX code (e.g. #FFCFE6)." },
      { name: "/roleicon <emoji>", value: "Sets a server emoji as your role icon. Requires Server Boost Level 2." },
      { name: "/roleinfo <role>", value: "Shows detailed info about a role (color, icon, permissions, members)." },
      { name: "/sharerole <user>", value: "Sends a prompt so another member can accept your role." },
      { name: "/deleterole", value: "Permanently deletes your custom role from the server." },
      { name: "/reactionrole", value: "Opens a role menu to pick pronoun, gender, and ping roles." },
      { name: "/rolehelp", value: "Shows this custom role help message." },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
