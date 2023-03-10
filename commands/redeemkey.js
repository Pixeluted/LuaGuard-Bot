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
  description: `USAGE: \`${process.env.PREFIX}redeemkey\``,
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
      return;
    }

    const infoMessage = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(client.user.username)
          .setDescription("We have sent you DM with instructions!")
          .setColor("White")
          .setTimestamp(),
      ],
    });

    let failed = false;

    await message.author
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("Please send the key you want to redeem!")
            .setColor("White")
            .setTimestamp(),
        ],
      })
      .catch((err) => {
        failed = true;
        infoMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription("We couldn't send you DM! Please enable DMs!")
              .setColor("White")
              .setTimestamp(),
          ],
        });
      });

    if (failed == false) {
      const filter = (m) => m.author.id == message.author.id;
      const collector = message.author.dmChannel.createMessageCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (m) => {
        collector.stop();
        const key = m.content;

        if (!client.activeKeys.includes(key)) {
          return message.author.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription("This is not valid key!")
                .setColor("White")
                .setTimestamp(),
            ],
          });
        }

        client.activeKeys.splice(client.activeKeys.indexOf(key), 1);

        try {
          const response = await axios({
            method: "GET",
            url: "https://api.luawl.com/whitelistUser.php",
            data: {
              token: process.env.LUAGUARD_TOKEN,
              discord_id: message.author.id,
            },
          });

          const guildMember = await message.guild.members.fetch(
            message.author.id
          );
          guildMember.roles.add(process.env.BUYER_ROLE_ID);

          return message.author.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription(
                  "You have successfully redeemed the key and you have been whitelisted!"
                )
                .setColor("White")
                .setTimestamp(),
            ],
          });
        } catch {
          return message.author.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription("Something went wrong! Please try again!")
                .setColor("White")
                .setTimestamp(),
            ],
          });
        }
      });
    }
  },
};
