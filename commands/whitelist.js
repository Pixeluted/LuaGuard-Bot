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
    }
  } catch (err) {
    return false;
  }
}

module.exports = {
  name: "whitelist",
  description: `USAGE: \`${process.env.PREFIX}whitelist <mention>/<userid>\``,
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
    let user;

    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      user = await client.users.fetch(args[0]);
    }

    if (!user) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You must specify a user to whitelist!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    if (await checkIfUserWhitelisted(user.id)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(`<@${user.id}> is already whitelisted!`)
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://api.luawl.com/whitelistUser.php",
        data: {
          token: process.env.LUAGUARD_TOKEN,
          discord_id: message.author.id,
        },
      });

      const guildMember = await message.guild.members.fetch(user.id);
      guildMember.roles.add(process.env.BUYER_ROLE_ID);

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(`<@${user.id}> has been successfully whitelisted!`)
            .setColor("White")
            .setTimestamp(),
        ],
      });
    } catch (err) {
      console.log(err);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(
              "Error occured while trying to whitelist this user!"
            )
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }
  },
};
