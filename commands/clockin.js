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

          message.channel.send(
            `${message.author} has clocked in\n Please use $status command for a new status\n If you are still working the same status from last time use the $restatus command `
          );
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

    // /**
    //  * Collects incoming message from the User
    //  */

    const filter = m => m.content && m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, {
      time: 15000
    });

    collector.on("collect", m => {
      if (m.content.includes("$status")) {
        console.log("received");
      }
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        let losAngelesDate = moment(message.createdAt)
          .tz("America/Los_Angeles")
          .format("MM-DD-YYYY hh:mm a z");

        message.channel.send(
          `${message.author} HAS NOT UPDATED THEIR STATUS SINCE CLOCKING AT\n ${losAngelesDate} `
        );
      } 
    });
  }
};
