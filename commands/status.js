const mongoose = require("mongoose");
const Status = require("../models/status");
const User = require("../models/user");
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
        .fetch("737423709048012840")
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
  name: "status",
  description: "The user will input their status",

  execute(message, args) {
    var moment = require("moment-timezone");
    var date = message.createdAt;

    var losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");

    if (!args.length) {
      return message.reply("you need to add a status!");
    }

    var description = args.join(" ");

    User.findOne({ discordID: message.author.id }, (err, u) => {
      if (err) console.log(err);

      if (!u) {
        const embedWarningMsg = new Discord.MessageEmbed()
          .setAuthor(
            message.author.username,
            message.author.displayAvatarURL({
              format: "png",
              dynamic: true,
            })
          )
          .setTitle("User is not registered please use the commnad $reg")
          .setColor(0xb60300)
          .setThumbnail(
            message.author.displayAvatarURL({
              format: "png",
              dynamic: true,
            })
          )
          .setTimestamp();

        message.channel.send(embedWarningMsg);
      } else if (u) {
        if (!u.punch) {
          const embedWarningMsg = new Discord.MessageEmbed()
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({
                format: "png",
                dynamic: true,
              })
            )
            .setTitle(
              `${message.author.username} please clock in to update status`
            )
            .setColor(0xb60300)
            .setThumbnail(
              message.author.displayAvatarURL({
                format: "png",
                dynamic: true,
              })
            )
            .setTimestamp();
          message.channel.send(embedWarningMsg);
        } else {
          u.status = !u.status;

          u.save()
            .then((u) => console.log(`Logged in`))
            .catch((err) => console.log(err));

          const status = new Status({
            discordID: message.author.id,
            username: message.author.username,
            content: description,
          });

          status
            .save()
            .then((res) => console.log("received"))
            .catch((error) => console.log(error));

          sendLatestStatuses(message.channel, status);

          /**
           * Sends the User's status to
           * the desired channel
           */

          /**
           * Timeout for the status
           * Should be set to 1 hour
           * Bot will send a message to the user
           * to update their status providing the previous status
           */
          setTimeout(() => {
            const embedStatusMsg = new Discord.MessageEmbed()
              .setAuthor(
                message.author.username,
                message.author.displayAvatarURL({
                  format: "png",
                  dynamic: true,
                })
              )
              .setTitle(
                `Ding! Ding!! ${message.author.username} Time to update your status!`
              )
              .setDescription(
                `\n Here was your previous status:\n \`\`\` ${status.content} \`\`\` \n Available Commands:\n $status : New Task\n $restatus : Still working on same task`
              )
              .setColor(0x00ae86)
              .setThumbnail(
                message.author.displayAvatarURL({
                  format: "png",
                  dynamic: true,
                })
              )
              .setTimestamp();
            message.channel.send(embedStatusMsg);
          }, 15000);
        }
      }
    });
  },
};
