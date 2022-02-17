const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dashboardUtil = require('../utils/dashboard.js');
const Coin = require("../models/coin");
const CryptoCurrency = require("../models/crypto-currency");
var sanitizer = require('sanitizer');
const portfolioStatistic = require("../models/portfolio-statistic.js");

const Dashboard = {
  test: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      return dashboardUtil.coingeckoCoinsList()
    },
  },

  index: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      // Do portfolio sync
      dashboardUtil.doPortfolioSync(userId);

      let statistics = {
        value: 0,
        cost: 0,
        gains: 0
      }

      const latestPortfolioStatistic = await portfolioStatistic.find({ user: userId }).limit(1).sort('-time').lean();

      if (latestPortfolioStatistic && latestPortfolioStatistic.length) {
        statistics.value = latestPortfolioStatistic[0].value
        statistics.cost = latestPortfolioStatistic[0].cost
        statistics.gains = latestPortfolioStatistic[0].gains
      }

      let chart = []

      return h.response({ success: true, statistics, chart }).code(200);
    },
  },

  coins: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      // Do portfolio sync
      dashboardUtil.doPortfolioSync(userId);

      const coins = await Coin.find({user: userId}).sort('-_id').lean();

      return h.response({ coins }).code(200);
    },
  },

  create: {
    auth: {
      strategy: 'jwt'
    },
    validate: {
      payload: {
        id: Joi.string().required(),
        balance: Joi.number().required(),
        cost: Joi.number().required(),
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

        let findCryptoCurrency = await CryptoCurrency.findOne({_id: data.id}).lean();

        // Ensure this crypto currency exists
        if (!findCryptoCurrency) {
          return Boom.badData("This crypto currency does not exist!");
        }

        // Ensure same coin is not added to the same portfolio
        if (await Coin.findOne({cryptocurrency: data.id, user: userId}).lean()) {
          return Boom.badData("You already have this coin in your portfolio!");
        }

        let coin = {
            balance: Number(sanitizer.escape(data.balance)),
            cost: Number(sanitizer.escape(data.cost)),
            value: 0,
            user: userId,
            cryptocurrency: findCryptoCurrency._id
        };

        let newCoin = await new Coin(coin).save();

        // Do portfolio sync
        dashboardUtil.doPortfolioSync(userId);

        return h.response(newCoin).code(200);
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
        balance: Joi.number().required(),
        cost: Joi.number().required(),
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
  
          let findCoin = await Coin.findOne({_id: id}).lean();

          if (findCoin) {
            let coin = await Coin.findById(findCoin._id)

            coin.balance = Number(sanitizer.escape(data.balance))
            coin.cost = Number(sanitizer.escape(data.cost))

            await new Coin(coin).save();

            // Do portfolio sync
            dashboardUtil.doPortfolioSync(userId);

            return h.response(coin).code(200);
          }
        }

        return Boom.badData("Something went wrong while updating the coin. Please try again later.");
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
          let coin = await Coin.findById(id)

          if (coin && (coin.user._id == userId)) {
            await Coin.deleteOne(coin);

            return h.response({ success: true, message: "Coin deleted successfully" }).code(200);
          }
        }

        return Boom.badData("Something went wrong while deleting the coin. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  }
};

module.exports = Dashboard;
  