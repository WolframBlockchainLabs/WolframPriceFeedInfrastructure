
import { initLogger }           from '../infrastructure/logger/logger.js';
import * as DomainModel         from '../domain-model/index.js';
import { OrderBookCollector }   from './OrderBook.js';
import { TradeCollector }       from './Trade.js';
import { TickerCollector }      from './Ticker.js';
import { CandleStickCollector } from './CandleStick.js';


export class CollectorManager {
    constructor({ collectorManager, db: dbConfig, logs, interval }) {
        this.exchangesConfig = collectorManager.exchanges;
        this.collectors = [];
        this.dbConfig = dbConfig;
        this.logs = logs;
        this.sequelize = null;
        this.interval = interval;

        this.initLogger();

        this.initDb();

        this.#initCollectors();
    }

    async initLogger() {
        this.loggers = initLogger(this.logs);
    }

    start() {
        this.initDb();
        this.#runCollectors();
        this.loggers.collector.info(`Collectors run with ${this.interval} interval`);
    }

    stop() {
        this.#stopCollectors();
        this.loggers.collector.info('Collector stopped');
    }

  #initCollectors() {
        const { exchangesConfig, collectors, sequelize, interval } = this;

        // eslint-disable-next-line guard-for-in
        for (const exchange in exchangesConfig) {
            for (const symbol of exchangesConfig[exchange].symbols) {
                const orderBook = new OrderBookCollector({ exchange, symbol }, interval, sequelize);

                const trade = new TradeCollector({ exchange, symbol }, interval, sequelize);

                const ticker = new TickerCollector({ exchange, symbol }, interval, sequelize);

                const candleStick = new CandleStickCollector({ exchange, symbol }, interval, sequelize);

                collectors.push(orderBook, trade, ticker, candleStick);
            }
        }
    }

  #runCollectors() {
      const { collectors } = this;

      for (const collector of collectors) {
          collector.start();
      }
  }

  #stopCollectors() {
      const { collectors } = this;

      for (const collector of collectors) {
          collector.stop();
      }
  }

  async initDb() {
      const sequelize = DomainModel.initModels(this.dbConfig);

      this.sequelize = sequelize;
  }
}
