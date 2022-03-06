"use strict";
const User = require("../models/user");

const Test = {
  deleteAllUsers: {
    auth: false,
    handler: async function (request, h) {
      await User.deleteMany({});

      return { success: true };
    },
  },
};

module.exports = Test;