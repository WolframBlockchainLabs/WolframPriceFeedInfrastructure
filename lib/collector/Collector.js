import ccxt from "ccxt";
import * as DomainModel from "../domain-model/index.js";

export class Collector {
  constructor({ exchange, market }, dbConfig) {
    this.exchange = exchange;
    this.market = market;
    this.dbConfig = dbConfig;
    this.sequelize = null;
  }

  start() {
    this.interval = setInterval(async () => {
      const { exchange, market } = this;

      console.info(this.exchange, this.market);

      this.initDb();

      const data = await this.fetchData(exchange, market);

      await this.saveData(data);
    }, 5000);
  }

  async fetchData() {
    const { exchange, market } = this;
    
    const exchangeIndex = ccxt.exchanges.indexOf(exchange);

    const exchangeInfo = new ccxt[ccxt.exchanges[exchangeIndex]]();

    await exchangeInfo.loadMarkets();

    try {
      return await exchangeInfo.fetchOrderBook(market);
    } catch (error) {
      console.error("Data did not receive", error);
    }
  }

  async saveData(data) {
    const { exchange, market, sequelize } = this;

    const { Exchange, Market, OrderBook } = sequelize;

    const { symbol, bids, asks } = data;

    const { id: exchangeId } = await Exchange.findOne({
      where: { externalExchangeId: exchange },
    });

    const {id: marketId} = await Market.findOne({
      where: { exchangeId, symbol },
    });

    try {
      await OrderBook.create({
        marketId,
        bids,
        asks,
      });
    } catch (error) {
      console.error("Data did not saved", error);
    }
  }

  initDb() {
    const sequelize = DomainModel.initModels(this.dbConfig);
    this.sequelize = sequelize;
  }

  stop() {
    clearInterval(this.interval);
  }
}
