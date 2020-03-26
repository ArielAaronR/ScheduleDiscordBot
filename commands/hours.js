const mongoose = require("mongoose");
const moment = require("moment");
const Clockin = require("../models/clockIn");
const Clockout = require("../models/clockOut");

module.exports = {
  name: "hours",
  description: "pulls a list of all the clock in and clock out",
  execute(message) {
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
              message.channel.send(`HOURS: 14 of the most recent hours\n ${scheduleArrStr}`);
            }
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};
