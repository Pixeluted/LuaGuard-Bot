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
  name: "redeemkey",
  description: `USAGE: \`${process.env.PREFIX}redeemkey <key>\``,
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
    let respondedMessage;

    setTimeout(() => {
      if (respondedMessage) {
        respondedMessage.delete();
      }
    }, 8000);

    if (await checkIfUserWhitelisted(message.author.id)) {
      respondedMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You are already whitelisted!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
      await message.delete();
      return;
    }

    const key = args[0];

    if (!key) {
      respondedMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("Please provide a key!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
      await message.delete();
      return;
    }

    if (!client.activeKeys.includes(key)) {
      respondedMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("This key is invalid!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
      await message.delete();
      return;
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

      client.activeKeys = client.activeKeys.filter((k) => k !== key);

      message.member.roles.add(process.env.BUYER_ROLE_ID);

      respondedMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You have been whitelisted!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
      await message.delete();
    } catch {
      respondedMessage = await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("An error occured while trying to redeem your key!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
      await message.delete();
    }
  },
};
