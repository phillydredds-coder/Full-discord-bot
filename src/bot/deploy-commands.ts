import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { REST, Routes } from "discord.js";
import * as createRole from "./slash-commands/create-role.js";
import * as roleName from "./slash-commands/role-name.js";
import * as roleColor from "./slash-commands/role-color.js";
import * as roleIcon from "./slash-commands/role-icon.js";
import * as deleteRole from "./slash-commands/delete-role.js";

import * as ban from "./slash-commands/ban.js";
import * as kick from "./slash-commands/kick.js";
import * as roleinfo from "./slash-commands/roleinfo.js";
import * as serverinfo from "./slash-commands/serverinfo.js";
import * as inviteinfo from "./slash-commands/inviteinfo.js";
import * as shareRole from "./slash-commands/share-role.js";
import * as roleHelp from "./slash-commands/role-help.js";
import * as modHelp from "./slash-commands/modhelp.js";
import * as economyHelp from "./slash-commands/economyhelp.js";
import * as sobboard from "./slash-commands/sobboard.js";
import * as reactionRole from "./slash-commands/reaction-role.js";
import * as mute from "./slash-commands/mute.js";
import * as unmute from "./slash-commands/unmute.js";
import * as restart from "./slash-commands/restart.js";
import * as economy from "./slash-commands/economy.js";
import * as serverCopier from "./slash-commands/server-copier.js";
import * as updatelog from "./slash-commands/updatelog.js";
import * as advertise from "./slash-commands/advertise.js";
import * as addupdate from "./slash-commands/addupdate.js";
import * as gamble from "./slash-commands/gamble.js";
import * as ecoGive from "./slash-commands/give.js";
import * as battle from "./slash-commands/battle.js";
import * as profile from "./slash-commands/profile.js";
import * as inventory from "./slash-commands/inventory.js";
import * as use from "./slash-commands/use.js";
import * as leaderboard from "./slash-commands/leaderboard.js";
import * as battlehelp from "./slash-commands/battlehelp.js";
import * as autohunt from "./slash-commands/autohunt.js";
import * as items from "./slash-commands/items.js";
import * as dollhelp from "./slash-commands/dollhelp.js";
import * as rrSetup from "./slash-commands/rr-setup.js";
import * as steal from "./slash-commands/steal.js";
import * as resetEconomy from "./slash-commands/reset-economy.js";
import * as huntadmin from "./slash-commands/huntadmin.js";
import * as promoview from "./slash-commands/promoview.js";

const loadDotenv = () => {
  const currentDir = resolve();
  const candidates = [
    resolve(currentDir, ".env"),
    resolve(currentDir, "../.env"),
    resolve(currentDir, "../../.env"),
  ];

  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    const body = readFileSync(envPath, "utf8");
    for (const line of body.split(/\r?\n/)) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=");
      if (!key || key.startsWith("#")) continue;
      if (!(key in process.env) && value.length > 0) {
        process.env[key] = value;
      }
    }
    break;
  }
};

loadDotenv();

const TOKEN = process.env["DISCORD_TOKEN"];
const CLIENT_ID = process.env["DISCORD_CLIENT_ID"];

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID");
  process.exit(1);
}

const commandsData = [
  createRole,
  roleName,
  roleColor,
  roleIcon,
  deleteRole,
  ban,
  kick,
  roleinfo,
  serverinfo,
  inviteinfo,
  shareRole,
  roleHelp,
  modHelp,
  economyHelp,
  sobboard,
  reactionRole,
  mute,
  unmute,
  restart,
  economy,
  serverCopier,
  updatelog,
  advertise,
  addupdate,
  gamble,
  ecoGive,
  battle,
  profile,
  inventory,
  use,
  leaderboard,
  battlehelp,
  autohunt,
  items,
  dollhelp,
  rrSetup,
  steal,
  resetEconomy,
  huntadmin,
  promoview,
].map((cmd) => cmd.data.toJSON());

const rest = new REST().setToken(TOKEN);

try {
  console.log(`Registering ${commandsData.length} slash commands globally...`);
  const result = await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commandsData }
  );
  console.log(`✅ Registered ${(result as unknown[]).length} commands globally.`);
} catch (err) {
  console.error("Failed to register commands:", err);
  process.exit(1);
}
