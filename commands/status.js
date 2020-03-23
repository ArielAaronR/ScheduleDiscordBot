const mongoose = require("mongoose");
const Status = require("../models/status");
const User = require("../models/user");

mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
        message.channel.send(
          "User is not registered please use the commnad $reg"
        );
      } else if (u) {
        if (!u.punch) {
          message.channel.send(
            `${u.username} please clock in to update status`
          );
        } else {
          u.status = !u.status;
          u.save()
            .then(u =>
              console.log(
                `${u.username} has logged a status and it set to ${u.status}`
              )
            )
            .catch(err => console.log(err));

          const status = new Status({
            discordID: message.author.id,
            username: message.author.username,
            content: description
          });

          status
            .save()
            .then(res => console.log(res))
            .catch(error => console.log(error));

          message.channel.send("Status recieved");

          setTimeout(() => {
            message.channel.send("Time to update your status");
          }, 3000);

          message.client.channels
            .fetch("689533676723372093")
            .then(channel => {
              console.log(channel);
              channel.send(
                ` ${message.author} updated their status here it is \n \`\`\` ${status.content}\`\`\``
              );
            })
            .catch(err => console.log(err));
          console.log(`${u.username} has made the status of ${status}`);
        }
      }
    });
  }
};
