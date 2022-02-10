"use strict";

const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
const env = require("dotenv");

const utils = require("./app/controllers/utils.js");

require("./app/models/db");

const dotenv = require("dotenv");

const result = dotenv.config();

if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

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
    validate: utils.validate,
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