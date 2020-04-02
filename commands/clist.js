const Discord = require("discord.js");

module.exports = {
  name: "clist",
  description: "A list of available commands",

  execute(message) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Hi here is a list of the available commands!")
      .setAuthor(
        "Clockdere",
        "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png",
        "https://yagami.xyz"
      )
      .setColor(0x00ae86)
      .setDescription(
        "$reg : register yourself to the database\n $clockin : clock in\n $clockout : clock out\n $status : update your current status "
      )
      .setThumbnail(
        "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
      )
      .setTimestamp();
    message.channel.send({ embed });
  }
};
