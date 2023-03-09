const Discord = require("discord.js");
const dotenv = require("dotenv");
const commandHandler = require("./handlers/commands");
dotenv.config();

const client = new Discord.Client({
  intents: [
    "MessageContent",
    "GuildMembers",
    "DirectMessages",
    "GuildMessages",
    "Guilds",
    "GuildBans",
  ],
});

client.legacyCommands = new Discord.Collection();
client.activeKeys = [];

client.once("ready", () => {
  commandHandler(client);
  console.log("Logged in as " + client.user.tag);
});

client.login(process.env.DISCORD_TOKEN);
