const Discord = require("discord.js");
const moment = require("moment");
const Clockin = require("../models/clockIn");
const Clockout = require("../models/clockOut");

function chunkArray(myArray) {
  const reducer = (previous, next) => {
    const start = moment(new Date(/:(.+)/.exec(previous.punch)[1]));
    const end = moment(new Date(/:(.+)/.exec(next.punch)[1]));
    const difference = start.diff(end);
    const duration = moment.duration(difference);
    const hours = Math.abs(duration.asMinutes() / 60);

    return hours;
  };
  let index = 0;
  const arrayLength = myArray.length;
  let tempArray = [];
  for (index = 0; index < arrayLength; index += 2) {
    myChunk = myArray.slice(index, index + 2);
    // we need atleast a in and out clock otherwise skip?
    if (myChunk.length < 2) {
      continue;
    }
    dateData = myChunk.reduce(reducer);
    tempArray.push(dateData);
  }

  const totalHours = arr => tempArray.reduce((a, b) => a + b, 0);

  return totalHours();
}
/**
 * Get the In and Out arrays
 * Create a List from the In and Out arrays sorted by the punch or createdAt
 * Create another function to computer the hours by the given date range
 *
 */

async function getHours(user, message, args) {
  let dateArray = args[1].split("-");

  let beforeDate = new Date(dateArray[0]);
  let afterDate = new Date(dateArray[1]);
  let lastHourMin = moment(afterDate).endOf("day");

  let inHours = await Clockin.find({ discordID: user }).catch(err =>
    console.log(err)
  );

  let outHours = await Clockout.find({ discordID: user }).catch(err =>
    console.log(err)
  );
  let hoursArr = [];

  inHours.forEach((i, indx) => {
    hoursArr.push(i);
    hoursArr.push(outHours[indx]);
  });

  hoursArr.sort((a, b) => {
    let keyA = new Date(a.createdAt),
      keyB = new Date(b.createdAt);

    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  let filteredHoursArr = hoursArr.filter(hours => {
    return hours != null;
  });

  let computeDateArray = [];
  filteredHoursArr.forEach(date => {
    if (date.createdAt >= beforeDate && date.createdAt <= lastHourMin) {
      computeDateArray.push({
        punch: date.punch
      });
    }
  });

  const grouped = chunkArray(computeDateArray);

  let dateString = "";
  computeDateArray.forEach(punch => {
    dateString = dateString + punch.punch + "\n";
  });
  const embedMsg = new Discord.MessageEmbed()
    .setAuthor(
      "Clockdere",
      "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png",
      "https://yagami.xyz"
    )
    .setTitle(`${dateString}\n Total hours ${grouped}`)
    .setColor(0x00ae86)
    .setThumbnail(
      "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
    )
    .setTimestamp();

  const embedWarningMsg = new Discord.MessageEmbed()
    .setAuthor(
      "Clockdere",
      "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png",
      "https://yagami.xyz"
    )
    .setTitle("Please add an appropiate date range")
    .setDescription("Format: $hours mm/dd/yy-mm/dd/yy")
    .setColor(0xb60300)
    .setThumbnail(
      "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
    )
    .setTimestamp();
  if (dateString.length) {
    message.author.send(embedMsg);
  } else {
    message.channel.send(embedWarningMsg);
  }
}

function getMentionUser(mentions) {
  const mentionUser = mentions.users;
  return mentionUser ? mentionUser.first() : null;
}

module.exports = {
  name: "xhours",
  description:
    "Admin role can request the hours of any given slave that is registered from any given date range",
  execute(message, args) {
    const aaron = "390655352774983700";
    const ryan = "626963007053758500";
    const angel = "628297621303328800";
    if (
      !message.author.id == aaron ||
      message.author.id == ryan ||
      message.author.id == angel
    )
      return;

    const mentionUser = getMentionUser(message.mentions);
    if (!mentionUser) {
      return message.channel.send("⚠️ You need to mention a user");
    }

    console.log(mentionUser.id);
    getHours(mentionUser.id, message, args);
  }
};
