const Boom = require("@hapi/boom");
const dashboardUtil = require('../utils/dashboard.js');
const APIToken = require("../models/api-token");
const CryptoCurrency = require("../models/crypto-currency");
const PortfolioStatistic = require("../models/portfolio-statistic.js");
const APITokenUsage = require("../models/api-token-usage.js");

const APISettings = {

  index: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      let token = await APIToken.findOne({user: userId});

      if (token) {
        return h.response(token).code(200);
      } else {
        return Boom.notFound("No token has been generated yet.");
      }
    },
  },
  
  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      let token = await APIToken.findOne({user: userId});

      if (token) {
        return Boom.badData("You already have a token generated.");
      } else {
        try {
          const payload = request.payload;

          if (payload && (payload.portfolio || payload.coin)) {
            let setting = "portfolio"
  
            if (payload.portfolio === false) {
              let findCryptoCurrency = await CryptoCurrency.findOne({_id: payload.coin}).lean();
  
              // Ensure this crypto currency exists
              if (!findCryptoCurrency) {
                return Boom.badData("This crypto currency does not exist!");
              }
  
              setting = payload.coin
            }

            let token = {
              token: await dashboardUtil.generateAPIToken(),
              settings: setting,
              user: userId
            };
  
            let newToken = await new APIToken(token).save();
  
            return h.response(newToken).code(201);
          }
  
          return Boom.badData("Something went wrong while creating the token. Please try again later.");
        } catch (err) {
          return Boom.badData(err.message);
        }
      }
    },
  },

  edit: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;
      const id = request.params.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      if (id) {
        try {
          const payload = request.payload;

          let findToken = await APIToken.findOne({_id: id, user: userId}).lean();
  
          if (findToken) {
            let token = await APIToken.findById(findToken._id)
  
            if (payload && (payload.portfolio || payload.coin)) {
              let setting = "portfolio"
    
              if (payload.portfolio === false) {
                let findCryptoCurrency = await CryptoCurrency.findOne({_id: payload.coin}).lean();
    
                // Ensure this crypto currency exists
                if (!findCryptoCurrency) {
                  return Boom.badData("This crypto currency does not exist!");
                }
    
                setting = payload.coin
              }
  
              token.settings = setting
  
              await new APIToken(token).save();
  
              return h.response(token).code(200);
            }
    
            return Boom.badData("Something went wrong while updating the token. Please try again later.");
          }
        } catch (err) {
          return Boom.badData(err.message);
        }
      }
    },
  },

  renew: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;
      const id = request.params.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      if (id) {
        try {
          let findToken = await APIToken.findOne({_id: id, user: userId}).lean();
  
          if (findToken) {
            let token = await APIToken.findById(findToken._id)
  
            token.token = await APISettingsUtil.generateAPIToken(),
  
            await new APIToken(token).save();

            return h.response(token).code(200);
          }
        } catch (err) {
          return Boom.badData(err.message);
        }
      }
    },
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
          let findToken = await APIToken.findOne({_id: id, user: userId}).lean();

          if (findToken) {
            await APIToken.deleteOne(findToken);

            return h.response({ success: true, message: "Token deleted successfully" }).code(200);
          }
        }

        return Boom.badData("Something went wrong while deleting the token. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },

  dashboard: {
    auth: false,
    handler: async function (request, h) {
      try {
        const token = request.params.token;

        if (token) {
          let findToken = await APIToken.findOne({token: token}).lean();

          if (findToken) {
            // Log token usage
            let usage = {
                token: findToken._id,
                useragent: request.headers["user-agent"],
                host: request.headers["host"]
            };
  
            await new APITokenUsage(usage).save();


            if (findToken.settings === "portfolio") {
              // Do portfolio sync
              await dashboardUtil.doPortfolioSync(findToken.user);

              let statistics = {
                value: 0,
                cost: 0,
                gains: 0,
                time: null
              }

              const latestPortfolioStatistic = await PortfolioStatistic.find({ user: findToken.user }).limit(1).sort('-time').lean();

              if (latestPortfolioStatistic && latestPortfolioStatistic.length) {
                statistics.value = Math.round(latestPortfolioStatistic[0].value * 100) / 100
                statistics.cost = Math.round(latestPortfolioStatistic[0].cost * 100) / 100
                statistics.gains = Math.round(latestPortfolioStatistic[0].gains * 100) / 100
                statistics.time = latestPortfolioStatistic[0].time
              }

              return h.response({ success: true, statistics }).code(200);
            }

            let findCryptoCurrency = await CryptoCurrency.findOne({_id: findToken.settings}).lean();

            // Ensure this crypto currency exists
            if (!findCryptoCurrency) {
              return Boom.badData("This crypto currency does not exist!");
            }

            return h.response({ success: true, coin: findCryptoCurrency.name, price: await dashboardUtil.coingeckoCoinValue(findCryptoCurrency.slug) }).code(200);
          }
        }

        return Boom.badData("Something went wrong while fetching the dashboard. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    },
  },

  usage: {
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
          let findToken = await APIToken.findOne({_id: id, user: userId}).lean();

          if (findToken) {
            let usage = await APITokenUsage.find({token: findToken._id}).sort('-_id').lean();

            return h.response(usage).code(200);
          }
        }

        return Boom.badData("Something went wrong while fetching the token usage. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },

  clearUsage: {
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
          let findToken = await APIToken.findOne({_id: id, user: userId}).lean();

          if (findToken) {
            await APITokenUsage.deleteMany({ token: findToken._id })

            return h.response({ success: true, message: "Token usage has been deleted successfully." }).code(200);
          }
        }

        return Boom.badData("Something went wrong while fetching the token usage. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },
};

module.exports = APISettings;
  