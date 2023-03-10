const axios = require("axios");
const { Client, Message, EmbedBuilder } = require("discord.js");

async function checkIfUserWhitelisted(discordId) {
  try {
    const response = await axios({
      method: "GET",
      url: "https://api.luawl.com/getKey.php",
      data: {
        token: process.env.LUAGUARD_TOKEN,
        discord_id: discordId,
      },
    });

    if (
      response.data.key_status == "Active" ||
      response.data.key_status == "Assigned"
    ) {
      return true;
    } else if (response.data == "No key found.") {
      return false;
    }
  } catch (err) {
    return false;
  }
}

module.exports = {
  name: "blacklist",
  description: `USAGE: \`${process.env.PREFIX}blacklist <mention>/<userid>\``,
  permissions: {
    requiredPermissions: [], // Add required permissions here
    requiredRoles: [process.env.WHITELIST_PERMISSIONS_ROLE_ID], // Add required role IDs here
  },
  /**
   *
   * @param {Client} client
   * @param {Message} message
   * @param {string[]} args
   */
  execute: async (client, message, args) => {
    if (args[0] == null) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You must specify a user to blacklist!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    let user;

    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      user = await client.users.fetch(args[0]);
    }

    if ((await checkIfUserWhitelisted(user.id)) == false) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("This user is not whitelisted!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://api.luawl.com/createBlacklist.php",
        data: {
          token: process.env.LUAGUARD_TOKEN,
          discord_id: user.id,
        },
      });

      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(`<@${user.id}> has been blacklisted!`)
            .setColor("White")
            .setTimestamp(),
        ],
      });
    } catch {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("An error occured while blacklisting the user!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }
  },
};
