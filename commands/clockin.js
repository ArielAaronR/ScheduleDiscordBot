const mongoose = require("mongoose");

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
    var moment = require("moment-timezone");

    var date = message.createdAt;

    var losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");

    const User = require("../models/user.js");

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
                `Recieved update to db here is the result:  ${res.username} has set status to ${res.status}`
              )
            )
            .catch(error => console.log(error));
          message.channel.send("You have clocked in bro! ");
          const ClockIn = require("../models/clockIn.js");

          /**
           * Creating the instance of the clockin
           */
          const clockIn = new ClockIn({
            discordID: message.author.id,
            username: message.author.username,
            punch: `In : ${losAngelesDate}`
          });

          clockIn
            .save()
            .then(res => console.log(` users has clocked in ${res}`))
            .catch(error => console.log(error));
          const utils = require("../utils/utils");

          utils.allUser.then(users => console.log(users));
        } else {
          message.channel.send(
            `Bro youre clocked in already get some work done`
          );
        }
      }
    });
  }
};
