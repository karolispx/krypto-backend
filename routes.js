"use strict";

const Users = require("./app/controllers/users");
const Dashboard = require("./app/controllers/dashboard");
const APISettings = require("./app/controllers/api-settings");

module.exports = [
  // User endpoints
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  { method: 'POST', path: '/api/users', config: Users.register },
  { method: 'POST', path: '/api/password-reset', config: Users.passwordReset },
  { method: 'GET', path: '/api/users/me', config: Users.authenticatedUser },
  { method: 'POST', path: '/api/users/me/email', config: Users.updateEmail },
  { method: 'POST', path: '/api/users/me/password', config: Users.updatePassword },

  // Dashboard endpoints
  { method: 'GET', path: '/api/dashboard', config: Dashboard.index },
  { method: 'GET', path: '/api/coins', config: Dashboard.coins },
  { method: 'POST', path: '/api/coins', config: Dashboard.create },
  { method: 'POST', path: '/api/coins/{id}', config: Dashboard.edit },
  { method: 'DELETE', path: '/api/coins/{id}', config: Dashboard.delete },

  // API Settings endpoints
  { method: 'GET', path: '/api/users/me/token', config: APISettings.index },
  { method: 'POST', path: '/api/users/me/token', config: APISettings.create },
  { method: 'POST', path: '/api/users/me/token/{id}', config: APISettings.edit },
  { method: 'POST', path: '/api/users/me/token/{id}/renew', config: APISettings.renew },
  { method: 'DELETE', path: '/api/users/me/token/{id}', config: APISettings.delete },
  { method: 'GET', path: '/api/dashboard/{token}', config: APISettings.dashboard },
  { method: 'GET', path: '/api/users/me/token/{id}/usage', config: APISettings.usage },
  { method: 'DELETE', path: '/api/users/me/token/{id}/usage', config: APISettings.clearUsage },



  { method: 'GET', path: '/api/test', config: Dashboard.test },

];

