const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = {
  name: "clockout",
  description: "The user will clock out their time",

  execute(message) {
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
          "User is not registered please use the commnad $reg"
        );
      } else if (u) {
        if (u.punch) {
          u.punch = !u.punch;
          u.save()
            .then(res =>
              console.log(
                `Recieved update to db here is the result:  ${res.username} set status to ${res.punch}`
              )
            )
            .catch(error => console.log(error));
          message.channel.send("You have clocked out bro!");

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
            .then(res => console.log(res))
            .catch(error => console.log(error));
            

          message.channel.send(
            `\`\`\`\ \n ${message.author.username} has clocked out at\n\n ${losAngelesDate} \n \`\`\``
          );
        } else {
          message.channel.send(`Bro you are clocked out already`);
        }
      }
    });
  }
};
