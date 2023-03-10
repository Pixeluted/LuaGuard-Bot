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
  name: "remove-whitelist",
  description: `USAGE: \`${process.env.PREFIX}remove-whitelist <mention>/<userid>\``,
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
            .setDescription("You must specify a user!")
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
            .setDescription(`<@${user.id}> is not whitelisted!`)
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    try {
      const response = await axios({
        method: "GET",
        url: "https://api.luawl.com/deleteKey.php",
        data: {
          token: process.env.LUAGUARD_TOKEN,
          discord_id: user.id,
        },
      });

      console.log(response.data);

      if (response.data == "Key Deleted Successfully") {
        const guildMember = await message.guild.members.fetch(user.id);
        guildMember.roles.remove(process.env.BUYER_ROLE_ID);
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription(`<@${user.id}> has been removed from whitelist!`)
              .setColor("White")
              .setTimestamp(),
          ],
        });
      } else {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription(
                "Something went wrong while removing user from whitelist!"
              )
              .setColor("White")
              .setTimestamp(),
          ],
        });
      }
    } catch {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(
              "Something went wrong while removing user from whitelist!"
            )
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }
  },
};
