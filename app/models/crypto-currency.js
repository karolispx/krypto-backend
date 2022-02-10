"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const cryptoCurrencySchema = new Schema({
  name: String,
  price: String,
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("CryptoCurrency", cryptoCurrencySchema);