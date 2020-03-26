const mongoose = require("mongoose");
const moment = require("moment");
const Clockin = require("../models/clockIn");
const Clockout = require("../models/clockOut");

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
  console.log(dateArray);

  let beforeDate = new Date(dateArray[0]);
  let afterDate = new Date(dateArray[1]);

  let computeDateArray = [];

  let filteredArray = sortedArr.filter(hours => {
    return hours != null;
  });

  filteredArray.forEach(date => {
    if (date.createdAt >= beforeDate && date.createdAt <= afterDate) {
      computeDateArray.push({
        punch: date.punch
      });
    }
  });

  let dateString = "";
  computeDateArray.forEach(punch => {
    dateString = dateString + punch.punch + "\n";
  });
  if (dateString.length) {
    message.channel.send(dateString);
  } else {
    message.channel.send("Oops");
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

            let scheduleArrStr = scheduleArr.join(" ");
            if (!scheduleArr.length) {
              message.channel.send(
                `You do not have an clock in/out logs please start by using the $clockin command`
              );
            } else {
              if (!args.length) {
                message.channel.send(
                  `HOURS: 14 of the most recent hours\n ${scheduleArrStr}`
                );
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
