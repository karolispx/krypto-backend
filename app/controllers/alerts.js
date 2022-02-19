const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const Alert = require("../models/alert");
var sanitizer = require('sanitizer');

const Alerts = {
  index: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      const alerts = await Alert.find({user: userId}).sort('-_id').lean();

      return h.response({ alerts }).code(200);
    },
  },

  create: {
    auth: {
      strategy: 'jwt'
    },
    validate: {
      payload: {
        notify: Joi.string().required(),
        rule: Joi.string().required(),
        number: Joi.number().required(),
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function(request, h) {
      try {
        const userId = request.auth.credentials.id;

        if (!userId) {
          return Boom.unauthorized("Not logged in");
        }

        const data = request.payload;

        if (data.notify === "portfolio" || data.notify === "coin") {
          if (data.rule === "eq" || data.rule === "lt" || data.rule === "gt") {
                    // Ensure same alert is not added to the same user
        if (await Alert.findOne({notify: data.notify, rule: data.rule, number: data.number, user: userId}).lean()) {
          return Boom.badData("You already have this alert setup!");
        }

        let alert = {
            notify: sanitizer.escape(data.notify),
            rule: sanitizer.escape(data.rule),
            number: Number(sanitizer.escape(data.number)),
            fired: false,
            user: userId
        };

        let newAlert = await new Alert(alert).save();

        return h.response(newAlert).code(200);
          } else {
            return Boom.badData("Rule is not valid!");
          }
        } else {
          return Boom.badData("Notify is not valid!");
        }
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },

  
  edit: {
    auth: {
      strategy: 'jwt'
    },
    validate: {
      payload: {
        notify: Joi.string().required(),
        rule: Joi.string().required(),
        number: Joi.number().required(),
      },
      failAction: function (request, h, error) {
        console.log(error.details)
        return Boom.badData(error.details);
      },
    },
    handler: async function(request, h) {
      try {
        const userId = request.auth.credentials.id;
        const id = request.params.id;
        
        if (!userId) {
          return Boom.unauthorized("Not logged in");
        }

        if (id) {
          const data = request.payload;
  
          if (data.notify === "portfolio" || data.notify === "coin") {
            if (data.rule === "eq" || data.rule === "lt" || data.rule === "gt") {
              let findAlert = await Alert.findOne({_id: id, user: userId}).lean();
  
              if (findAlert) {
                let alert = await Alert.findById(findAlert._id)
    
                alert.notify = sanitizer.escape(data.notify)
                alert.rule = sanitizer.escape(data.rule)
                alert.number = Number(sanitizer.escape(data.number))
    
                await new Alert(alert).save();
    
                return h.response(alert).code(200);
              }
            } else {
              return Boom.badData("Rule is not valid!");
            }
          } else {
            return Boom.badData("Notify is not valid!");
          }
        }

        return Boom.badData("Something went wrong while updating the alert. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },

  refresh: {
    auth: {
      strategy: 'jwt'
    },
    handler: async function(request, h) {
      try {
        const userId = request.auth.credentials.id;
        const id = request.params.id;
        
        if (!userId) {
          return Boom.unauthorized("Not logged in");
        }

        if (id) {
          let findAlert = await Alert.findOne({_id: id, user: userId}).lean();
  
          if (findAlert) {
            let alert = await Alert.findById(findAlert._id)

            if (alert.fired === false) {
              return Boom.badData("This alert has not been fired yet.");
            }

            alert.fired = false

            await new Alert(alert).save();

            return h.response(alert).code(200);
          }
        }

        return Boom.badData("Something went wrong while deleting the alert. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },

  delete: {
    auth: {
      strategy: 'jwt'
    },
    handler: async function(request, h) {
      try {
        const userId = request.auth.credentials.id;
        const id = request.params.id;
        
        if (!userId) {
          return Boom.unauthorized("Not logged in");
        }

        if (id) {
          let findAlert = await Alert.findOne({_id: id, user: userId}).lean();
  
          if (findAlert) {
            await Alert.deleteOne(findAlert);

            return h.response({ success: true, message: "Alert deleted successfully" }).code(200);
          }
        }

        return Boom.badData("Something went wrong while deleting the alert. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  }
};

module.exports = Alerts;
  