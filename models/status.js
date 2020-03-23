const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema(
  {
    discordID: { type: Number },
    username: { type: String },
    content: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Status", StatusSchema);
