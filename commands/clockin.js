const mongoose = require("mongoose");
const Status = require("../models/status");
var moment = require("moment-timezone");

const Discord = require("discord.js");

const User = require("../models/user.js");

// mongoose.connect("mongodb://localhost/TestPunchs", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
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

function sendLatestStatuses(channel) {
  Status.find()
    .then((sList) => {
      let brandNewDopeArray = sList.reverse();
      let newListArr = [];
      let alreadyAddedIDs = [];

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
          " \n " +
          status.time +
          "\n\n";
      });

      const embededStatusBoard = new Discord.MessageEmbed()
        .setTitle("Status Board")
        .setAuthor(
          "Clockdere",
          "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png",
          "https://yagami.xyz"
        )
        .setDescription(`${smexyString}`)
        .setColor(0x00ae86)
        .setThumbnail(
          "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
        )
        .setTimestamp();

      channel.client.channels
        .fetch("695362410713841716")
        .then((channel) => {
          channel
            .bulkDelete(1)
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
  name: "clockin",
  description: "The user will clock in their time",

  execute(message) {
    /**
     * Convert incoming message with moment.js
     * from any timezone to PST/PDT
     */
    let moment = require("moment-timezone");

    let date = message.createdAt;

    let losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");

    /**
     * Find the User and Create the clockin object
     * and save to the db
     */

    User.findOne({ discordID: message.author.id }, (err, u) => {
      if (err) console.log(err);

      if (!u) {
        message.channel.send(
          "User is not registered please use the command $reg"
        );
      } else if (u) {
        if (!u.punch) {
          u.punch = !u.punch;
          u.save()
            .then((res) =>
              console.log(
                `Recieved update to db here is the result:  ${res.username} has set status to ${res.punch}`
              )
            )
            .catch((error) => console.log(error));

          const ClockIn = require("../models/clockIn.js");

          /**
           * Creating the instance of the clockin
           */
          const clockIn = new ClockIn({
            discordID: message.author.id,
            username: message.author.username,
            punch: `In : ${losAngelesDate}`,
          });

          clockIn
            .save()
            .then((res) => console.log(` users has clocked in`))
            .catch((error) => console.log(error));

          const embedClockinMsg = new Discord.MessageEmbed()
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTitle(`${message.author.username} has clocked in`)
            .setDescription(
              `Please use $status command for a new status\n If you are still working the same status from last time use the $restatus command `
            )
            .setColor(0x00ae86)
            .setThumbnail(
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTimestamp();

          message.channel.send(embedClockinMsg);

          sendLatestStatuses(message.channel);
          /**
           * Create an Await Message function
           * wih a timer so that it will
           * reminder the user to message until
           * they make a status
           */

          // /**
          //  * Collects incoming message from the User
          //  */

          const filter = (m) => m.content && m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector(filter, {
            time: 600000,
          });

          collector.on("collect", (m) => {
            if (m.content.includes("$status")) {
              console.log("received");
            }
          });

          collector.on("end", (collected) => {
            if (collected.size === 0) {
              let losAngelesDate = moment(message.createdAt)
                .tz("America/Los_Angeles")
                .format("MM-DD-YYYY hh:mm a z");
              const embedMsg = new Discord.MessageEmbed()

                .setTitle(
                  `${message.author.username} has not updated their status since clocking in at ${losAngelesDate}`
                )
                .setAuthor(
                  message.author.username,
                  message.author.displayAvatarURL({
                    format: "png",
                    dynamic: true,
                  })
                )
                .setColor(0x00ae86)
                .setThumbnail(
                  message.author.displayAvatarURL({
                    format: "png",
                    dynamic: true,
                  })
                )
                .setTimestamp();

              message.channel.send(embedMsg);
            }
          });
        } else {
          const embedMsg = new Discord.MessageEmbed()
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTitle(" Bro youre clocked in already get some work done")
            .setColor(0xb60300)
            .setThumbnail(
              "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
            )
            .setTimestamp();
          message.channel.send(embedMsg);
        }
      }
    });
  },
};
