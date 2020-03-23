const mongoose = require("mongoose");

const ClockOutSchema = new mongoose.Schema(
  {
    discordID: { type: Number },
    username: { type: String },
    punch: { type: String }
  },
  { timestamps: true }
);
module.exports = mongoose.model("ClockOut", ClockOutSchema);
