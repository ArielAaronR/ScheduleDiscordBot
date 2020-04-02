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
  // console.log(tempArray);
  return [totalHours(), tempArray];
}

/**
 * Function takes in the arguments from the user
 * example "032520-032620"
 * Get the argument and split it by the "-"
 * convert the numbers to actual dates
 * splice sorted array from that range
 * so that it would be 03/24 < sortedArr < 03/26
 * The calculate those hours in that range
 */
function computeHours(message, args, sortedArr) {
  let dateArray = args[0].split("-");

  let beforeDate = new Date(dateArray[0]);
  let afterDate = new Date(dateArray[1]);
  let lastHourMin = moment(afterDate).endOf("day");
  let computeDateArray = [];

  let filteredArray = sortedArr.filter(hours => {
    return hours != null;
  });

  filteredArray.forEach(date => {
    if (date.createdAt >= beforeDate && date.createdAt <= lastHourMin) {
      computeDateArray.push({
        punch: date.punch
      });
    }
  });
  const grouped = chunkArray(computeDateArray);

  const combinedHourArr = [];
  const eachHourArr = grouped[1];

  // for (let i = 0; i < combinedHourArr.length; i++) {
  //   combinedHourArr[i].push(eachHourArr[i]);
  // }

  computeDateArray.forEach(punch => {
    combinedHourArr.push(punch.punch);
  });
  let newCombinedHourArr = [];
  for (let i = 0; i < combinedHourArr.length; i += 2) {
    let splicedArr = combinedHourArr.slice(i, i + 2);
    if (splicedArr.length < 2) {
      continue;
    }
    newCombinedHourArr.push(splicedArr);
  }
  for (let i = 0; i < newCombinedHourArr.length; i++) {
    newCombinedHourArr[i].push(eachHourArr[i]);
  }

  let reformatSchedule = [];
  for (let i = 0; i < newCombinedHourArr.length; i++) {
    let string = "";
    string = ` ${newCombinedHourArr[i][0]}\n${newCombinedHourArr[i][1]}
    **Hours: ${newCombinedHourArr[i][2]}**`;
    reformatSchedule.push(string);
  }

  let dateString = "";
  for (let i = 0; i < reformatSchedule.length; i++) {
    dateString += reformatSchedule[i] + "\n\n";
  }
  if (dateString.length) {
    let momentBeforeDate = moment(beforeDate).format("MM-DD-YYYY");
    let momentAfterDate = moment(afterDate).format("MM-DD-YYYY");

    const embedHoursRange = new Discord.MessageEmbed()
      .setAuthor(
        message.author.username,
        message.author.displayAvatarURL({ format: "png", dynamic: true })
      )
      .setTitle(`Hours from ${momentBeforeDate} to ${momentAfterDate}`)
      .setDescription(
        `${dateString}
      **Total Hours ${grouped[0]}**`
      )
      .setColor(0x00ae86)
      .setThumbnail(
        message.author.displayAvatarURL({ format: "png", dynamic: true })
      )
      .setTimestamp();

    message.channel.send(embedHoursRange);
  } else {
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

    message.channel.send(embedWarningMsg);
  }
}

module.exports = {
  name: "hours",
  description: "pulls a list of all the clock in and clock out",
  execute(message, args) {
    var clockin = Clockin.find({ discordID: message.author.id })
      .then(ins => {
        let inArray = [];
        for (let i = 0; i < ins.length; i++) {
          inArray.push(ins[i]);
        }
        return inArray;
      })
      .catch(err => console.log(err));

    var clockout = Clockout.find({ discordID: message.author.id })
      .then(outs => {
        let outArray = [];
        for (let i = 0; i < outs.length; i++) {
          outArray.push(outs[i]);
        }
        return outArray;
      })
      .catch(err => console.log(err));

    clockin
      .then(inArray => {
        clockout
          .then(outArray => {
            let inOutArray = [];

            inArray.forEach((i, indx) => {
              inOutArray.push(i);
              inOutArray.push(outArray[indx]);
            });

            let sortedArr = inOutArray
              .sort((a, b) => {
                let keyA = new Date(a.createdAt),
                  keyB = new Date(b.createdAt);
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
              })
              .filter(hours => {
                return hours != null;
              });

            let scheduleArr = sortedArr
              .map(hour => hour.punch)
              .slice(sortedArr.length - 14, sortedArr.length);

            let scheduleArrStr = "";
            scheduleArr.forEach(hour => {
              scheduleArrStr = scheduleArrStr + hour + "";
            });
            if (!scheduleArr.length) {
              const embededWarningMsg = new Discord.MessageEmbed()
                .setTitle(
                  "You do not have an clock in/out logs please start by using the $clockin command"
                )
                .setColor(0xb60300)
                .setThumbnail(
                  "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
                )
                .setTimestamp();

              message.channel.send(embededWarningMsg);
            } else {
              if (!args.length) {
                const embed14hours = new Discord.MessageEmbed()
                  .setTitle("HOURS: 14 of the most recent hours")
                  .setDescription(`${scheduleArrStr}`)
                  .setColor(0x00ae86)
                  .setThumbnail(
                    "https://yagami.xyz/content/uploads/2018/11/discord-512-1.png"
                  )
                  .setTimestamp();

                message.channel.send(embed14hours);
              } else {
                computeHours(message, args, sortedArr);
              }
            }
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};
