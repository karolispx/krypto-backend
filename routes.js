"use strict";

const Users = require("./app/controllers/users");

module.exports = [
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate }
];

