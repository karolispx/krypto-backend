const CryptoCurrency = require("../models/crypto-currency");
const CoinGecko = require('coingecko-api');
var sanitizer = require('sanitizer');
const Coin = require("../models/coin");
const User = require("../models/user");
const PortfolioStatistic = require("../models/portfolio-statistic");
const bcrypt = require('bcrypt');

exports.generateAPIToken = async function (request) {
  let randomString = (Math.random() + 1).toString(36).substring(7)
  
  let token = await bcrypt.hash(randomString, 10);

  token = token.replace(/[^a-z0-9]/gi, '');

  return token;
};

exports.coingeckoCoinsList = async function (request) {
  const CoinGeckoClient = new CoinGecko();

  let list = await CoinGeckoClient.coins.list();

  if (list && list.data) {
    list.data.forEach(async (coin) => {
      if (coin.id && coin.symbol && coin.name) {
        let findCryptoCurrency = await CryptoCurrency.findOne({symbol: coin.symbol}).lean();

        // Coin exists, update it
        if (findCryptoCurrency) {          
          let cryptoCurrency = await CryptoCurrency.findById(findCryptoCurrency._id)
          cryptoCurrency.name = sanitizer.escape(coin.name)
          cryptoCurrency.slug = sanitizer.escape(coin.slug)
        
          await new CryptoCurrency(cryptoCurrency).save();
        } else {
          // Create it
          let cryptoCurrency = {
            name: sanitizer.escape(coin.name),
            symbol: sanitizer.escape(coin.symbol),
            slug: coin.id
          };
  
          await new CryptoCurrency(cryptoCurrency).save();
        }
      }
    });

    return list.data
  }

  return false;
};

exports.coingeckoCoinValue = async function (slug, request) {
  const CoinGeckoClient = new CoinGecko();

  let markets = await CoinGeckoClient.coins.markets({ids: [slug], vs_currency: "eur"});

  if (markets && markets.data && markets.data.length) {
    let price = markets.data[0].current_price;

    if (price) {
      return price
    }
  }
  
  return false
};

exports.doPortfolioSync = async function (userId, request) {
  const CoinGeckoClient = new CoinGecko();
  
  if (userId && await User.findOne({ _id: userId })) {
    const coins = await Coin.find({ user: userId }).populate(["cryptocurrency"]).sort('-_id').lean();

    let userCoins = {};

    if (coins && coins.length) {
      coins.forEach(async (coin) => {
        userCoins[coin.cryptocurrency.slug] = {
          slug: coin.cryptocurrency.slug,
          id: coin._id,
          balance: coin.balance,
          cost: coin.cost,
          value: 0
        }
      });
    }
  
    if (userCoins && Object.keys(userCoins).length) {
      let markets = await CoinGeckoClient.coins.markets({ids: Object.keys(userCoins), vs_currency: "eur"});

      if (markets && markets.data && markets.data.length) {
        markets.data.forEach(async (market) => {
          let userCoin = userCoins[market.id]

          userCoins[market.id].value = userCoin.balance * market.current_price
        });
      }
    }

    let value = 0
    let cost = 0

    for (let userCoin of Object.values(userCoins)) {
      let findCoin = await Coin.findOne({_id: userCoin.id}).lean();

      if (findCoin) {
        let coin = await Coin.findById(findCoin._id)

        coin.value = Number(userCoin.value)

        await new Coin(coin).save();

        value += userCoin.value
        cost += userCoin.cost
      }
    }

    let portfolioStatistic = {
      value: Number(value),
      cost: Number(cost),
      gains: Number(value - cost),
      user: userId
    };

    await new PortfolioStatistic(portfolioStatistic).save();
  }
};