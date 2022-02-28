"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const portfolioStatisticSchema = new Schema({
  value: Number,
  cost: Number,
  gains: Number,
  daily: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("PortfolioStatistic", portfolioStatisticSchema);