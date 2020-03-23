const mongoose = require("mongoose");

const ClockInSchema = new mongoose.Schema(
  {
    discordID: { type: Number },
    username: { type: String },
    punch: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClockIn", ClockInSchema);
