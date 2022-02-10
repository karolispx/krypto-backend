"use strict";

const Mongoose = require("mongoose");
const Boom = require("@hapi/boom");
const Schema = Mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email: String,
  password: String,
  time : { type : Date, default: Date.now }
});

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email : email});
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  if (!isMatch) {
    return Boom.unauthorized('Password mismatch');
  }
  
  return this;
};

module.exports = Mongoose.model("User", userSchema);