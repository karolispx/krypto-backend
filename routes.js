"use strict";

const Users = require("./app/controllers/users");

module.exports = [
  // User endpoints
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  { method: 'POST', path: '/api/users', config: Users.register },
  { method: 'POST', path: '/api/password-reset', config: Users.passwordReset },
  { method: 'GET', path: '/api/users/me', config: Users.authenticatedUser },
  { method: 'POST', path: '/api/users/me/email', config: Users.updateEmail },
  { method: 'POST', path: '/api/users/me/password', config: Users.updatePassword },
];

