const mongoose = require("mongoose");
const Status = require("../models/status");
const Discord = require("discord.js");
var moment = require("moment-timezone");

const uri =
  "mongodb+srv://discordClockBot:clockdere135@cluster0.ktfqa.mongodb.net/discordClockBot?retryWrites=true&w=majority";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));

function sendLatestStatuses(channel, status) {
  Status.find()
    .then((sList) => {
      let brandNewDopeArray = sList.reverse();
      let newListArr = [];
      let alreadyAddedIDs = [];

      brandNewDopeArray = brandNewDopeArray.filter(
        (state) => state.discordID != status.discordID
      );
      newListArr.push({
        name: status.username,
        status: status.content,
        time: moment(status.createdAt)
          .tz("America/Los_Angeles")
          .format("MM-DD-YYYY hh:mm a z"),
      });

      for (let i = 0; i < brandNewDopeArray.length; i++) {
        if (!alreadyAddedIDs.includes(brandNewDopeArray[i].discordID)) {
          newListArr.push({
            name: brandNewDopeArray[i].username,
            status: brandNewDopeArray[i].content,
            time: moment(brandNewDopeArray[i].createdAt)
              .tz("America/Los_Angeles")
              .format("MM-DD-YYYY hh:mm a z"),
          });
          alreadyAddedIDs.push(brandNewDopeArray[i].discordID);
        }
      }
      var smexyString = "";
      newListArr.forEach((status) => {
        smexyString =
          smexyString +
          "**" +
          status.name +
          "**" +
          " => " +
          status.status +
          "\n " +
          status.time +
          "\n\n";
      });
      const embededStatusBoard = new Discord.MessageEmbed()
        .setTitle("Status Board")
        .setDescription(`${smexyString}`)
        .setThumbnail(
          "https://www.seekpng.com/png/detail/135-1355054_clipboard-clipart-svg-clipboard-with-pen-icon.png"
        )
        .setColor(0x00ae86)
        .setTimestamp();
      channel.client.channels
        .fetch("695362410713841716")
        .then((channel) => {
          channel
            .bulkDelete(2)
            .then((messages) =>
              console.log(`${messages.size} has been deleted`)
            )
            .catch((err) => console.log(err));
          channel.send(embededStatusBoard);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}
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
        message.author.displayAvatarURL({ format: "png", dynamic: true })
      )
      .setTimestamp();

    Status.findOne({ discordID: message.author.id })
      .sort({ createdAt: -1 })
      .then((s) => {
        const status = new Status({
          discordID: s.discordID,
          username: s.username,
          content: s.content,
        });

        status
          .save()
          .then((res) => res)
          .catch((error) => console.log(error));
        sendLatestStatuses(message.channel, status);
        message.channel.send(embedMsg);

        setTimeout(() => {
          const embedReminderMsg = new Discord.MessageEmbed()
            .setTitle(
              `Ding! Ding!! ${message.author.username} Time to update your status!`
            )
            .setDescription(
              `\n Here was your previous status:\n \`\`\` ${status.content} \`\`\` \n Available Commands:\n $status : New Task\n $restatus : Still working on same task`
            )
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setColor(0x00ae86)
            .setThumbnail(
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTimestamp();

          message.channel.send(embedReminderMsg);
        }, 15000);
      })
      .catch((err) => console.log(err));
  },
};
