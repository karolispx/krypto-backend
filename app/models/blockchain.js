"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const blockchainSchema = new Schema({
  name: String,
  slug: String,
  nativetoken: String,
  scanurl: String,
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("Blockchain", blockchainSchema);