const { Client, Message, EmbedBuilder } = require("discord.js");

function generateRandomKey() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

module.exports = {
  name: "genkey",
  description: `USAGE: \`${process.env.PREFIX}genkey <amount>\``,
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
    const count = args[0] | 1;

    if (count > 100) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription("You can only generate 100 keys at a time!")
            .setColor("White")
            .setTimestamp(),
        ],
      });
    }

    const generatedKeys = [];

    for (let i = 0; i < count; i++) {
      generatedKeys.push(generateRandomKey());
    }

    let isCancelled = false;

    let keyStrings = generatedKeys.map((key) => `\`${key}\` \n`);
    keyStrings = keyStrings.join("").replace(",", "");

    await message.author
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(`Here are your generated keys! \n ${keyStrings}`)
            .setColor("White")
            .setTimestamp(),
        ],
      })
      .catch(() => {
        isCancelled = true;
        return message.reply({
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
      });

    if (isCancelled == false) {
      client.activeKeys.push(...generatedKeys);

      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(client.user.username)
            .setDescription(
              "We have sucessfully generated a new key/keys to redeem and sent it to you via DM!"
            )
            .setColor("White")
            .setTimestamp(),
        ],
      });

      console.log(client.activeKeys);
    }
  },
};
