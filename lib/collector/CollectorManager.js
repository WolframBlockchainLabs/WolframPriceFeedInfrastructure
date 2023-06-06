import { initLogger } from "../infrastructure/logger/logger.js";
import * as DomainModel from "../domain-model/index.js";
import { OrderBookCollector } from "./OrderBook.js";
import { TradeCollector } from "./Trade.js";
import { TickerCollector } from "./Ticker.js";
import { CandleStickCollector } from "./CandleStick.js";
import { MarketService } from "./marketService.js";

export class CollectorManager {
  constructor({ db, logs, symbols, exchange }) {
    this.exchange = exchange;
    this.symbols = symbols;

    this.dbConfig = db;
    this.logs = logs;
    this.sequelize = DomainModel.initModels(this.dbConfig);
    this.loggers = initLogger(this.logs);
  }

  async start() {
    await this.#process();

    await this.sequelize.sequelize.close();

    this.loggers.collector.info("===============THE END=================");
  }

  async #process() {
    const { symbols, exchange, sequelize, interval } = this;

    const market = new MarketService(sequelize);

    const collectors = [];

    for (const symbol of symbols) {
      const { marketId } = await market.getMarketInfo(exchange, symbol);

      const orderBook = new OrderBookCollector(
        { exchange, symbol },
        sequelize,
        marketId
      );

      const trade = new TradeCollector(
        { exchange, symbol },
        sequelize,
        marketId
      );

      const ticker = new TickerCollector(
        { exchange, symbol },
        sequelize,
        marketId
      );

      const candleStick = new CandleStickCollector(
        { exchange, symbol },
        sequelize,
        marketId
      );

      collectors.push(
        orderBook.start(),
        trade.start(),
        ticker.start(),
        candleStick.start()
      );
    }

    return Promise.all(collectors);
  }
}
