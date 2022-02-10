"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const portfolioStatisticSchema = new Schema({
  value: String,
  cost: String,
  gains: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("PortfolioStatistic", portfolioStatisticSchema);