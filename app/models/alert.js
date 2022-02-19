"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const alertSchema = new Schema({
  notify: String,
  rule: String,
  number: Number,
  fired: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("Alert", alertSchema);