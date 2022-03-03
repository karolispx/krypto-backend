"use strict";

const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const Moralis = require('moralis/node');

const env = require("dotenv");
const userUtil = require("./app/utils/user.js");

const scheduler = require("./scheduler")

require("./app/models/db");

const dotenv = require("dotenv");

const result = dotenv.config();

if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

scheduler.configure();

Moralis.start({ serverUrl: process.env.MORALIS_SERVER_URL, appId: process.env.MORALIS_APP_ID });

const server = Hapi.server(
  {
    port: process.env.PORT || 8080,
    routes: { cors: true },
  }
);

async function init() {
  await server.register(require('hapi-auth-jwt2'));

  server.validator(require("@hapi/joi"));

  server.auth.strategy("jwt", "jwt", {
    key: process.env.JWT_SECRET,
    validate: userUtil.validate,
    verifyOptions: { algorithms: ["HS256"] },
  });
  
  server.auth.default("jwt");

  server.route(require("./routes"));

  await server.start();
  
  console.log(`Server running at: ${server.info.uri}`);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();