const Discord = require("discord.js");

module.exports = {
  name: "clist",
  description: "A list of available commands",

  execute(message) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Hi here is a list of the available commands!")
      .setColor(0x00ae86)
      .setDescription(
        "$reg : register yourself to the database\n\n $clockin : clock in\n\n $clockout : clock out\n\n $status : update your current status\n\n $restatus : repost previous status as your current status\n\n $hours : This will provide given hours from a specific date range must be in this format mm/dd/yy-mm/dd/yy"
      )
      .setTimestamp();
    message.channel.send({ embed });
  }
};
