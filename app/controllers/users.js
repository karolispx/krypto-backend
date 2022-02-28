const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const userUtil = require('../utils/user.js');
const User = require("../models/user");
const PasswordReset = require("../models/password-reset");
const bcrypt = require('bcrypt');
const dashboardUtil = require('../utils/dashboard.js');
const emailUtil = require('../utils/email.js');

const env = require('dotenv');
env.config();

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
          const token = userUtil.createToken(user);

          return h.response({ success: true, token: token }).code(201);
        }
      } catch (err) {
        return Boom.notFound("internal db failure");
      }
    },
  },

  register: {
    auth: false,
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        repeatpassword: Joi.string().required(),
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function (request, h) {
      try {
        const payload = request.payload;

        if (payload.password !== payload.repeatpassword) {
          return Boom.badData("Passwords do not match");
        }

        let user = await User.findByEmail(payload.email);

        if (user) {
          return Boom.badData("Email address is already registered");
        }

        const newUser = new User({
          email: payload.email,
          password: await bcrypt.hash(payload.password, 10)
        });

        user = await newUser.save();

        const token = userUtil.createToken(user);

        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },

  passwordReset: {
    auth: false,
    validate: {
      payload: {
        email: Joi.string().email().required()
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function (request, h) {
      try {
        const payload = request.payload;
  
        let user = await User.findByEmail(payload.email);

        if (user) {
          // User exists, send email
          let newPasswordReset = await new PasswordReset({
            token: await dashboardUtil.generateAPIToken(),
            user: user._id
          }).save();

          let passwordResetUrl = process.env.FRONTEND_URL + '/reset-password/' + newPasswordReset.token;

          await emailUtil.sendEmail(
            user.email, "Krypto - Password Reset", 
            await emailUtil.passwordResetEmail(passwordResetUrl)
            );
        }

        // User does not exists, no email sent but do not notify user if account doesn't exist
        return h.response({ success: true, message: "Email has been sent out with password reset instructions if this email exists." }).code(200);
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },

  passwordResetFlow: {
    auth: false,
    validate: {
      payload: {
        email: Joi.string().email().required(),
        newpassword: Joi.string().required(),
        repeatpassword: Joi.string().required(),
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function (request, h) {
      try {
        const payload = request.payload;
        const token = request.params.token;

        if (!token) {
          return Boom.badData("Please provide all information.");
        }

        let user = await User.findByEmail(payload.email);

        if (!user) {
          return Boom.badData("Email address is not valid.");
        }

        let passwordResetToken = await PasswordReset.findOne({user: user._id, token: token});

        if (!passwordResetToken) {
          return Boom.badData("Password reset token is not valid.");
        }
      
        if (payload.newpassword !== payload.repeatpassword) {
          return Boom.badData("New passwords do not match");
        }

        user.password = await bcrypt.hash(payload.newpassword, 10);

        await user.save();

        return h.response({ success: true, message: "Your password has been reset successfully!" }).code(200);
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },

  authenticatedUser: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      return h.response(await User.findOne({ _id: userId })).code(200);
    },
  },

  updateEmail: {
    auth: {
      strategy: "jwt",
    },
    validate: {
      payload: {
        email: Joi.string().email().required()
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      try {
        const userEdit = request.payload;
  
        const user = await User.findById(userId);

        if (userEdit.email === user.email) {          
          return Boom.badData("No email change detected");
        }

        // Validate email address
        if (await User.findOne({email: userEdit.email, _id: {$ne: userId} }).lean()) {          
          return Boom.badData("Email address is already registered");
        }

        user.email = userEdit.email;

        await user.save();

        return h.response(user).code(200);
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },

  updatePassword: {
    auth: {
      strategy: "jwt",
    },
    validate: {
      payload: {
        currentpassword: Joi.string().required(),
        newpassword: Joi.string().required(),
        repeatpassword: Joi.string().required()
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      try {
        const userEdit = request.payload;
  
        const user = await User.findById(userId);

        if (!await bcrypt.compare(userEdit.currentpassword, user.password)) {
          return Boom.unauthorized("Invalid password");
        }

        if (userEdit.newpassword !== userEdit.repeatpassword) {
          return Boom.badData("New passwords do not match");
        }

        if (await bcrypt.compare(userEdit.newpassword, user.password)) {
          return Boom.unauthorized("No password change detected");
        }

        user.password = await bcrypt.hash(userEdit.newpassword, 10);

        await user.save();

        return h.response(user).code(200);
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },
};

module.exports = Users;
  