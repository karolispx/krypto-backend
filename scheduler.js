"use strict";

const dashboardUtil = require('./app/utils/dashboard.js');
const cron = require('node-cron');

exports.configure = async function () {
  // Scheduled to run every 5 minutes to process user alerts
  cron.schedule('*/5 * * * *', async function() {
    await dashboardUtil.processAlerts();
  });

  // Update crypto currencies every hour
  cron.schedule('0 * * * *', async function() {
    await dashboardUtil.coingeckoCoinsList();
  });

  // Run a daily portfolio sync at 6am for all users for dashboard chart
  cron.schedule('0 6 * * *', async function() {
    await dashboardUtil.syncAllPortfolios(true);
  });
};


