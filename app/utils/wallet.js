const Blockchain = require("../models/blockchain");
const Wallet = require("../models/wallet");

const Moralis = require('moralis/node');
var web3 = require('web3')

exports.processUserWallets = async function (userId, request) {
  const wallets = await Wallet.find({ user: userId }).populate(["blockchain"]).sort('-time').lean();

  if (wallets && wallets.length) {
    await Promise.all(wallets.map(async (wallet) => {
      console.log("Process wallet: " + wallet.name)

      let walletData = {
        tokens: []
      };

      let getNativeBalance = await this.getNativeBalance(wallet);
      
      if (getNativeBalance && getNativeBalance > 0) {
        walletData.tokens.push({symbol: wallet.blockchain.nativetoken.toUpperCase(), balance: getNativeBalance})
      }

      let getTokenBalances = await this.getTokenBalances(wallet);

      if (getTokenBalances && getTokenBalances.length) {
        getTokenBalances.forEach(async (token) => {
          let tokenBalanceFromWei = await this.getBalanceFromWei(token.balance);

          walletData.tokens.push({symbol: token.symbol, balance: Number(tokenBalanceFromWei)})
        });
      }

      let getWallet = await Wallet.findById(wallet._id)

      getWallet.data = walletData;

      await new Wallet(getWallet).save();
    }));
  }
};

exports.getNativeBalance = async function (wallet, request) {
  const options = { chain: wallet.blockchain.slug, address: wallet.address, order: "desc", from_block: "0" };

  const getNativeBalance = await Moralis.Web3API.account.getNativeBalance(options);

  return Number(await this.getBalanceFromWei(getNativeBalance.balance))
};

exports.getTokenBalances = async function (wallet, request) {
  const options = { chain: wallet.blockchain.slug, address: wallet.address, order: "desc", from_block: "0" };

  return await Moralis.Web3API.account.getTokenBalances(options);
};

exports.getBalanceFromWei = async function (balance, request) {
  return await web3.utils.fromWei(balance);
};