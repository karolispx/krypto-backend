"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const apiTokenUsageSchema = new Schema({
  useragent: String,
  host: String,
  token: {
    type: Schema.Types.ObjectId,
    ref: "APIToken"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("APITokenUsage", apiTokenUsageSchema);