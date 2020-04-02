const mongoose = require("mongoose");
const Status = require("../models/status");
const User = require("../models/user");

mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function sendLatestStatuses(channel, status) {
  Status.find()
    .then(sList => {
      let brandNewDopeArray = sList.reverse();
      let newListArr = [];
      let alreadyAddedIDs = [];

      brandNewDopeArray = brandNewDopeArray.filter(
        state => state.discordID != status.discordID
      );
      newListArr.push({
        name: status.username,
        status: status.content
      });

      for (let i = 0; i < brandNewDopeArray.length; i++) {
        if (!alreadyAddedIDs.includes(brandNewDopeArray[i].discordID)) {
          newListArr.push({
            name: brandNewDopeArray[i].username,
            status: brandNewDopeArray[i].content
          });
          alreadyAddedIDs.push(brandNewDopeArray[i].discordID);
        }
      }
      var smexyString = "";
      newListArr.forEach(status => {
        smexyString = smexyString + status.name + " => " + status.status + "\n";
      });
      channel.send(`\`\`\`${smexyString}\`\`\``);
    })
    .catch(err => console.log(err));
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
            message.channel.send(
              `Ding! Ding!! ${message.author} Time to update your status!\n Here was your previous status:\n \`\`\` ${status.content} \`\`\` \n Available Commands:\n $status : New Task\n $restatus : Still working on same task`
            );
          }, 15000);
        }
      }
    });
  }
};
