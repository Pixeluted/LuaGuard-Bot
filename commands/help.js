const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: `USAGE: \`${process.env.PREFIX}help\``,
  permissions: {
    requiredPermissions: [], // Add required permissions here
    requiredRoles: [], // Add required role IDs here
  },
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {string[]} args
   */
  execute: async (client, message, args) => {
    const helpEmbed = new EmbedBuilder()
      .setTitle(client.user.username)
      .setDescription("Here are all the commands you can use!")
      .setColor("White")
      .setTimestamp();

    await client.legacyCommands.forEach((cmd) => {
      let canUserUseThis = true;

      if (cmd.permissions.requiredPermissions.length > 0) {
        for (const permission of cmd.permissions.requiredPermissions) {
          if (!message.member.permissions.has(permission)) {
            canUserUseThis = false;
          }
        }
      }

      if (cmd.permissions.requiredRoles.length > 0) {
        for (const role of cmd.permissions.requiredRoles) {
          if (!message.member.roles.cache.has(role)) {
            canUserUseThis = false;
          }
        }
      }

      if (canUserUseThis) {
        helpEmbed.addFields([{ name: cmd.name, value: cmd.description }]);
      }
    });

    await message.channel.send({
      embeds: [helpEmbed],
    });
  },
};
