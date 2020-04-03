const mongoose = require("mongoose");
const Status = require("../models/status");
const Discord = require("discord.js");
var moment = require("moment-timezone");

mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function sendLatestStatuses(channel, message) {
  Status.find()
    .then(sList => {
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
              .format("MM-DD-YYYY hh:mm a z")
          });
          alreadyAddedIDs.push(brandNewDopeArray[i].discordID);
        }
      }
      var smexyString = "";
      newListArr.forEach(status => {
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
        .setColor(0x00ae86)
        .setThumbnail(
          "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
        )
        .setTimestamp();
      channel.client.channels
        .fetch("695362410713841716")
        .then(channel => {
          channel
            .bulkDelete(1)
            .then(messages => console.log(`${messages.size} has been deleted`))
            .catch(err => console.log(err));
          channel.send(embededStatusBoard);
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

module.exports = {
  name: "clockout",
  description: "The user will clock out their time",

  execute(message) {
    var date = message.createdAt;

    var losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");

    const User = require("../models/user.js");

    User.findOne({ discordID: message.author.id }, (err, u) => {
      if (err) console.log(err);

      if (!u) {
        const embedNotReg = new Discord.MessageEmbed()
          .setAuthor(
            message.author.username,
            message.author.displayAvatarURL({ format: "png", dynamic: true })
          )
          .setTitle("User is not registered please use the command $reg")
          .setColor(0xb60300)
          .setThumbnail(
            "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
          )
          .setTimestamp();
        message.channel.send(embedNotReg);
      } else if (u) {
        if (u.punch) {
          u.punch = !u.punch;
          u.save()
            .then(res => console.log(`recieved`))
            .catch(error => console.log(error));

          /**
           * Creating the instance of clockout
           */
          const ClockOut = require("../models/clockOut.js");

          const clockOut = new ClockOut({
            discordID: message.author.id,
            username: message.author.username,
            punch: `Out : ${losAngelesDate}`
          });

          clockOut
            .save()
            .then(res => console.log("Receieved"))
            .catch(error => console.log(error));

          const embedClockOutMsg = new Discord.MessageEmbed()
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTitle(
              `${message.author.username} has clocked out at ${losAngelesDate}`
            )
            .setColor(0x00ae86)
            .setThumbnail(
              "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
            )
            .setTimestamp();

          message.channel.send(embedClockOutMsg);

          sendLatestStatuses(message.channel, message);
        } else {
          const embededMsg = new Discord.MessageEmbed()
            .setAuthor(
              message.author.username,
              message.author.displayAvatarURL({ format: "png", dynamic: true })
            )
            .setTitle("Bro you are clocked out already")
            .setColor(0xb60300)
            .setThumbnail(
              "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
            )
            .setTimestamp();

          message.channel.send(embededMsg);
        }
      }
    });
  }
};
