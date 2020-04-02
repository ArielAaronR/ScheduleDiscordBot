const mongoose = require("mongoose");
const Status = require("../models/status");
const Discord = require("discord.js");
mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = {
  name: "restatus",
  description:
    "If the user is still working the same task they use the command to say so",

  execute(message) {
    var moment = require("moment-timezone");
    var date = message.createdAt;
    var losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");
    const embedMsg = new Discord.MessageEmbed()
      .setTitle("Status Recieved")
      .setAuthor(
        message.author.username,
        message.author.displayAvatarURL({ format: "png", dynamic: true })
      )
      .setColor(0x00ae86)
      .setThumbnail(
        "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
      )
      .setTimestamp();

    Status.findOne({ discordID: message.author.id })
      .sort({ createdAt: -1 })
      .then(s => {
        const status = new Status({
          discordID: s.discordID,
          username: s.username,
          content: s.content
        });

        status
          .save()
          .then(res => res)
          .catch(error => console.log(error));
        message.channel.send(embedMsg);
      })
      .catch(err => console.log(err));

    setTimeout(() => {
      const embedReminderMsg = new Discord.MessageEmbed()
        .setTitle(
          "Ding! Ding!! Time to update your status with the command $status! If you are still working on the same task make sure to use $restatus command!"
        )
        .setAuthor(
          message.author.username,
          message.author.displayAvatarURL({ format: "png", dynamic: true })
        )
        .setColor(0x00ae86)
        .setThumbnail(
          "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
        )
        .setTimestamp();

      message.channel.send(embedReminderMsg);
    }, 15000);
  }
};
