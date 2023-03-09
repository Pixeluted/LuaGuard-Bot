const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = (client) => {
  console.log("Loading commands...");
  fs.readdirSync("./commands").forEach((file) => {
    const loadedCommand = require(`../commands/${file}`);

    if (loadedCommand.execute) {
      client.legacyCommands.set(loadedCommand.name, loadedCommand);
    }
  });

  console.log("Commands loaded!");

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === "DM") return;

    const prefix = process.env.PREFIX;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const cmd = client.legacyCommands.get(command);

    if (!cmd) return;

    if (cmd.permissions.requiredPermissions.length > 0) {
      for (const permission of cmd.permissions.requiredPermissions) {
        if (!message.member.permissions.has(permission)) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription(
                  `You aren't authorized to execute this command! <@${message.member.id}>`
                )
                .setColor("White"),
            ],
          });
        }
      }
    }

    if (cmd.permissions.requiredRoles.length > 0) {
      for (const role of cmd.permissions.requiredRoles) {
        if (!message.member.roles.cache.has(role)) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription(
                  `You aren't authorized to execute this command! <@${message.member.id}>`
                )
                .setColor("White"),
            ],
          });
        }
      }
    }

    try {
      cmd.execute(client, message, args);
    } catch (error) {
      console.log(
        "Error occured while executing command " + command + ":" + error
      );
    }
  });
};
