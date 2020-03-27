const moment = require("moment");
const Clockin = require("../models/clockIn");
const Clockout = require("../models/clockOut");
/**
 * Get the In and Out arrays
 * Create a List from the In and Out arrays sorted by the punch or createdAt
 * Create another function to computer the hours by the given date range
 *
 */
async function getHours(user, message) {
  let inHours = await Clockin.find({ discordID: user }).catch(err =>
    console.log(err)
  );

  let outHours = await Clockout.find({ discordID: user }).catch(err =>
    console.log(err)
  );
  let hoursArr = []

  
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
    const CHANCELLOR = "529149269404286994";
    if (!message.member.hasPermission(CHANCELLOR)) return;

    const mentionUser = getMentionUser(message.mentions);
    if (!mentionUser) {
      return message.channel.send("⚠️ You need to mention a user");
    }

    console.log(mentionUser.id);
    getHours(mentionUser.id, message);
  }
};
