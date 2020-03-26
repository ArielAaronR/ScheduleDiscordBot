const mongoose = require("mongoose");
const Status = require("../models/status");
const User = require("../models/user");
mongoose.connect("mongodb://localhost/TestPunchs", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

module.exports = {
  name: "restatus",
  description:
    "If the user is still working the same task they use the command to say so",

  execute(message) {
    var moment = require("moment-timezone");
    var date = message.createdAt;
    var losAngelesDate = moment(date)
      .tz("America/Los_Angeles")
      .format("MM-DD-YYYY hh:mm a z");

    Status.findOne({ discordID: message.author.id })
      .sort({ createdAt: -1 })
      .then(s => {
        const status = new Status({
          discordID: s.discordID,
          username: s.username,
          content: s.content
        });

        status
          .save()
          .then(res => console.log(res))
          .catch(error => console.log(error));
        message.channel.send(`Status recieved!`);
      })
      .catch(err => console.log(err));

    setTimeout(() => {
      message.channel.send(
        "Ding! Ding!! Time to update your status with the command $status! If you are still working on the same task make sure to use $restatus command!"
      );
    }, 15000);
  }
};
