"use strict";

const Users = require("./app/controllers/users");
const Dashboard = require("./app/controllers/dashboard");
const Wallets = require("./app/controllers/wallets");
const Blockchains = require("./app/controllers/blockchains");
const Alerts = require("./app/controllers/alerts");
const APISettings = require("./app/controllers/api-settings");

module.exports = [
  // User endpoints
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  { method: 'POST', path: '/api/users', config: Users.register },
  { method: 'POST', path: '/api/password-reset', config: Users.passwordReset },
  { method: 'POST', path: '/api/password-reset/{token}', config: Users.passwordResetFlow },
  { method: 'GET', path: '/api/users/me', config: Users.authenticatedUser },
  { method: 'POST', path: '/api/users/me/email', config: Users.updateEmail },
  { method: 'POST', path: '/api/users/me/password', config: Users.updatePassword },

  // Dashboard endpoints
  { method: 'GET', path: '/api/dashboard/{force?}', config: Dashboard.index },
  { method: 'GET', path: '/api/coins', config: Dashboard.coins },
  { method: 'POST', path: '/api/coins', config: Dashboard.create },
  { method: 'POST', path: '/api/coins/{id}', config: Dashboard.edit },
  { method: 'DELETE', path: '/api/coins/{id}', config: Dashboard.delete },

  // Blockchains endpoints
  { method: 'GET', path: '/api/blockchains', config: Blockchains.index },

  // Wallets endpoints
  { method: 'GET', path: '/api/wallets', config: Wallets.index },
  { method: 'POST', path: '/api/wallets', config: Wallets.create },
  { method: 'POST', path: '/api/wallets/{id}', config: Wallets.edit },
  { method: 'DELETE', path: '/api/wallets/{id}', config: Wallets.delete },

  // API Settings endpoints
  { method: 'GET', path: '/api/users/me/token', config: APISettings.index },
  { method: 'POST', path: '/api/users/me/token', config: APISettings.create },
  { method: 'POST', path: '/api/users/me/token/{id}', config: APISettings.edit },
  { method: 'POST', path: '/api/users/me/token/{id}/renew', config: APISettings.renew },
  { method: 'DELETE', path: '/api/users/me/token/{id}', config: APISettings.delete },
  { method: 'GET', path: '/api/endpoint-dashboard/{token}', config: APISettings.dashboard },
  { method: 'GET', path: '/api/users/me/token/{id}/usage', config: APISettings.usage },
  { method: 'DELETE', path: '/api/users/me/token/{id}/usage', config: APISettings.clearUsage },

  // Alert Settings endpoints
  { method: 'GET', path: '/api/users/me/alerts', config: Alerts.index },
  { method: 'POST', path: '/api/users/me/alerts', config: Alerts.create },
  { method: 'POST', path: '/api/users/me/alerts/{id}', config: Alerts.edit },
  { method: 'POST', path: '/api/users/me/alerts/{id}/refresh', config: Alerts.refresh },
  { method: 'DELETE', path: '/api/users/me/alerts/{id}', config: Alerts.delete },
];

