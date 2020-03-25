const mongoose = require("mongoose");
const Status = require("../models/status");
mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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

    const User = require("../models/user.js");
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
            .then(res =>
              console.log(
                `Recieved update to db here is the result:  ${res.username} has set status to ${res.punch}`
              )
            )
            .catch(error => console.log(error));

          const ClockIn = require("../models/clockIn.js");

          /**
           * Creating the instance of the clockin
           */
          const clockIn = new ClockIn({
            discordID: message.author.id,
            username: message.author.username,
            punch: `In : ${losAngelesDate}\n`
          });

          clockIn
            .save()
            .then(res => console.log(` users has clocked in ${res}`))
            .catch(error => console.log(error));

          Status.findOne({ discordID: message.author.id })
            .sort({ createdAt: -1 })
            .then(status => {
              
              message.channel.send(`${status.createdAt} `);
            })
            .catch(err => console.log(err));
        } else {
          message.channel.send(
            `Bro youre clocked in already get some work done`
          );
        }
      }
    });
    /**
     * Create an Await Message function
     * wih a timer so that it will
     * reminder the user to message until
     * they make a status
     */

    // const filter = message => message.content;
    // const collector = message.channel.createMessageCollector(
    //   filter,
    //   m => m.author.id === message.author.id
    // );
    // /**
    //  * Collects incoming message from the User
    //  */
    // collector.on("collect", message => {
    //   message.channel.send(message.content);
    // });
    // collector.on("end", collected => {
    //   message.channel.send(`Status has been collected  `);
    //   console.log(`The collected ${collected.content}`);
    // });
    // const filter = m => m.content && m.author.id === message.author.id;
    // const collector = message.channel.createMessageCollector(filter, {
    //   time: 15000
    // });

    // collector.on("collect", m => {
    //   if (m.content.includes("$status")) {
    //     message.channel.send(`Collected `);
    //   }
    // });

    // collector.on("end", collected => {
    //   if (collected.size === 0) {
    //     message.channel.send(
    //       "Bro you need to update your status after clocking in "
    //     );
    //   } else {
    //     message.channel.send(`Collected ${collected.size} items`);
    //   }
    // });
  }
};
