"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const coinSchema = new Schema({
  name: String,
  balance: String,
  cost: String,
  value: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("Coin", coinSchema);