const Boom = require("@hapi/boom");
const Blockchain = require("../models/blockchain.js");

const Blovkchains = {
  index: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const userId = request.auth.credentials.id;

      if (!userId) {
        return Boom.unauthorized("Not logged in");
      }

      const blockchains = await Blockchain.find().lean();

      return h.response({ success: true, blockchains }).code(200);
    },
  }
};

module.exports = Blovkchains;
  