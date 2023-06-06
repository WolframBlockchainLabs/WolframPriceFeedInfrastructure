// eslint-disable-next-line import/no-unresolved
import ccxt from "ccxt";
import { logger } from "../infrastructure/logger/logger.js";

const level = "collector";

export default class Collector {
  constructor({ exchange, symbol }, sequelize, marketId) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.sequelize = sequelize;
    this.marketId = marketId;
    this.exchangeAPI = new ccxt[exchange]();
  }

  async start() {
    const { exchange, symbol, marketId } = this;

    logger(level).info(`Collector for '${exchange}' ${symbol} is running`);

    try {
      const data = await this.fetchData();

      await this.saveData(data, marketId);

      console.log(this.constructor.name, this.exchange, this.symbol);
    } catch (error) {
      logger(level).error("Collector has finished with error", error);
    }
  }
}

