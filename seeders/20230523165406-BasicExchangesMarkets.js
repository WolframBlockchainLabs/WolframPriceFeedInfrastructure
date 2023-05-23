"use strict";

const exchanges = [
  {
    externalExchangeId: "binance",
    name: "Binance",
  },
  {
    externalExchangeId: "kucoin",
    name: "KuCoin",
  },
  {
    externalExchangeId: "gemini",
    name: "Gemini",
  },
  {
    externalExchangeId: "kraken",
    name: "Kraken",
  },
  {
    externalExchangeId: "bitfinex",
    name: "Bitfinex",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Exchanges", exchanges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Exchanges", exchanges, {});
  },
};
