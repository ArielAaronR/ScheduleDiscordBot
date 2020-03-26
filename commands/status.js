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

    message.client.channels
      .fetch("692493652546551860")
      .then(channel => {
        // channel.send(
        //   ` ${message.author} updated their status here it is \n \`\`\` ${status.content}\`\`\``
        // );

        /**
         * Get All the Status
         * Sort them to be the most recent
         * Make an array where it will only get
         * the most recent status from each User
         *
         */
        Status.find()
          .then(sList => {
            let newListArr = [];

            for (let i = sList.length - 1; i > 0; i--) {
              //last left off
            }

            console.log(newListArr);
            // channel.send(` \`\`\`Status Board:
            // ${newListArr}
            // \`\`\` `);
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};
