const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const walletUtil = require('../utils/wallet.js');
const Wallet = require("../models/wallet.js");
const Blockchain = require("../models/blockchain.js");

const Wallets = {
  index: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      // Process user wallets
      await walletUtil.processUserWallets(userId);

      const wallets = await Wallet.find({ user: userId }).populate(["blockchain"]).sort('-time').lean();

      return h.response({ success: true, wallets }).code(200);
    },
  },

  create: {
    auth: {
      strategy: 'jwt'
    },
    validate: {
      payload: {
        name: Joi.string().required(),
        address: Joi.string().required(),
        blockchain: Joi.string().required(),
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

        let findBlockchain = await Blockchain.findOne({slug: data.blockchain}).lean();

        // Ensure this blockchain currency exists
        if (!findBlockchain) {
          return Boom.badData("This blockchain does not exist!");
        }

        // Ensure same wallet is not added twice
        if (await Wallet.findOne({name: data.name, user: userId}).lean()) {
          return Boom.badData("You already have this wallet in your portfolio!");
        }

        if (await Wallet.findOne({address: data.address, blockchain: findBlockchain._id, user: userId}).lean()) {
          return Boom.badData("You already have this wallet in your portfolio!");
        }

        let wallet = {
            name: data.name,
            address: data.address,
            data: {},
            blockchain: findBlockchain._id,
            user: userId
        };

        let newWallet = await new Wallet(wallet).save();

        return h.response(newWallet).code(200);
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
        name: Joi.string().required(),
        address: Joi.string().required(),
        blockchain: Joi.string().required(),
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
  
          let findWallet = await Wallet.findOne({_id: id, user: userId}).lean();
  
          if (findWallet) {
            let findBlockchain = await Blockchain.findOne({slug: data.blockchain}).lean();

            // Ensure this blockchain currency exists
            if (!findBlockchain) {
              return Boom.badData("This blockchain does not exist!");
            }

            if (await Wallet.findOne({address: data.address, blockchain: findBlockchain._id, user: userId, _id: {$ne: findWallet._id}}).lean()) {
              return Boom.badData("You already have this wallet in your portfolio!");
            }

            let wallet = await Wallet.findById(findWallet._id)

            wallet.name = data.name
            wallet.address = data.address
            wallet.blockchain = findBlockchain._id

            await new Wallet(wallet).save();

            return h.response(wallet).code(200);
          }
        }

        return Boom.badData("Something went wrong while updating the wallet. Please try again later.");
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
          let findWallet = await Wallet.findOne({_id: id, user: userId}).lean();
  
          if (findWallet) {
            await Wallet.deleteOne(findWallet);

            return h.response({ success: true, message: "Wallet deleted successfully" }).code(200);
          }
        }

        return Boom.badData("Something went wrong while deleting the wallet. Please try again later.");
      } catch (err) {
        return Boom.badData(err.message);
      }
    }
  },
};

module.exports = Wallets;
  