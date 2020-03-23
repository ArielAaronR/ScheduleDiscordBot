const mongoose = require("mongoose");

module.exports = {
  name: "reg",
  description: " This command will create a user for the databse",

  execute(message) {
    mongoose.connect("mongodb://localhost/TestPunchs", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const User = require("../models/user.js");

    User.findOne({ discordID: message.author.id }, (err, u) => {
      if (err) console.log(err);
      if (!u) {
        const user = new User({
          discordID: message.author.id,
          username: message.author.username,
          status: 0
        });
        user
          .save()
          .then(res => console.log("**************\n\n saved to db\n\n" + res))
          .catch(error => console.log(error));
        message.channel.send("Congrats you have registered");
      } else {
        message.channel.send("You exist already tf");

        console.log(u + " is already in db");
      }
    });
  }
};
