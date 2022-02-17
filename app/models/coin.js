"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const coinSchema = new Schema({
  balance: Number,
  cost: Number,
  value: Number,
  cryptocurrency: {
    type: Schema.Types.ObjectId,
    ref: "CryptoCurrency"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("Coin", coinSchema);