const mongoose = require("mongoose");
const Discord = require("discord.js");

module.exports = {
  name: "reg",
  description: " This command will create a user for the databse",

  execute(message) {
    const uri =
      "mongodb+srv://discordClockBot:clockdere135@cluster0.ktfqa.mongodb.net/discordClockBot?retryWrites=true&w=majority";
    mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("MongoDB Connected…");
      })
      .catch((err) => console.log(err));

    const User = require("../models/user.js");

    User.findOne({ discordID: message.author.id }, (err, u) => {
      if (err) console.log(err);
      if (!u) {
        const user = new User({
          discordID: message.author.id,
          username: message.author.username,
          status: 0,
        });
        user
          .save()
          .then((res) =>
            console.log("**************\n\n saved to db\n\n" + res)
          )
          .catch((error) => console.log(error));
        const embedMsg = new Discord.MessageEmbed()
          .setAuthor(
            message.author.username,
            message.author.displayAvatarURL({ format: "png", dynamic: true })
          )
          .setTitle("Congratulations you have registered!")
          .setColor(0x00ae86)
          .setThumbnail(
            "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
          )
          .setTimestamp();
        message.channel.send(embedMsg);
      } else {
        const embedWarningMsg = new Discord.MessageEmbed()
          .setAuthor(
            message.author.username,
            message.author.displayAvatarURL({ format: "png", dynamic: true })
          )
          .setTitle("You are already registered in to ")
          .setColor(0xb60300)
          .setThumbnail(
            "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
          )
          .setTimestamp();
        message.channel.send(embedWarningMsg);
      }
    });
  },
};
