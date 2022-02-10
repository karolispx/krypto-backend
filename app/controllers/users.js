const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const utils = require('./utils.js');
const User = require("../models/user");
const bcrypt = require('bcrypt');

const Users = {
  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await User.findOne({ email: request.payload.email });

        if (!user) {
          return Boom.unauthorized("User not found");
        } else if (!await bcrypt.compare(request.payload.password, user.password)) {
          return Boom.unauthorized("Invalid password");
        } else {
          const token = utils.createToken(user);

          return h.response({ success: true, token: token }).code(201);
        }
      } catch (err) {
        return Boom.notFound("internal db failure");
      }
    },
  }
};

module.exports = Users;
  