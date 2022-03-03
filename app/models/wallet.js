"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const walletSchema = new Schema({
  name: String,
  address: String,
  data: Object,
  blockchain: {
    type: Schema.Types.ObjectId,
    ref: "Blockchain"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  time : { type : Date, default: Date.now }
});

module.exports = Mongoose.model("Wallet", walletSchema);