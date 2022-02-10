"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const apiTokenSchema = new Schema({
  token: String,
  settings: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("APIToken", apiTokenSchema);