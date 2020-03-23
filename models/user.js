const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    discordID: { type: Number },
    username: { type: String },
    //Clock In or Out Flag
    punch: { type: Boolean },
    //Status Flag
    status: { type: Boolean }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
