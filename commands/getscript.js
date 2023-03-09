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
      return [true, response.data.wl_key];
    } else if (response.data == "No key found.") {
      return [false];
    }
  } catch (err) {
    return [false];
  }
}
module.exports = {
  name: "getscript",
  description: `USAGE: \`${process.env.PREFIX}getscript\``,
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
    const resultData = await checkIfUserWhitelisted(message.author.id);
    const result = resultData[0];
    const whitelistKey = resultData[1];

    if (result == true) {
      const loaderURL = process.env.LOADER_URL;

      if (whitelistKey == null) {
        message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription("An error occurred while getting your key!")
              .setColor("White")
              .setTimestamp(),
          ],
        });
        return;
      }

      let isCancelled = false;

      await message.author
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription(
                `This is your script! \n **DO NOT SHARE THIS WITH ANYONE ELSE**\n \`\`\`lua\n_G.wl_key = "${whitelistKey}" \n\nloadstring(game:HttpGet("${loaderURL}"))() \`\`\``
              )
              .setColor("White")
              .setTimestamp(),
          ],
        })
        .catch(() => {
          message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(client.user.username)
                .setDescription(
                  `I couldn't send you a DM, please enable them and try again! <@${message.member.id}>`
                )
                .setColor("White")
                .setTimestamp(),
            ],
          });
          isCancelled = true;
        });

      if (isCancelled == false) {
        message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(client.user.username)
              .setDescription(
                `I have sent you a DM with your script! <@${message.member.id}>`
              )
              .setColor("White")
              .setTimestamp(),
          ],
        });
      }
    } else {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You aren't whitelisted!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }
  },
};
