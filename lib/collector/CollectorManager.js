
import { initLogger }         from '../infrastructure/logger/logger.js';
import * as DomainModel       from '../domain-model/index.js';
import { OrderBookCollector } from './OrderBook.js';

const interval = 60000;


export class CollectorManager {
    constructor({ collectorManager, db: dbConfig, logs }) {
        this.exchangesConfig = collectorManager.exchanges;
        this.collectors = [];
        this.dbConfig = dbConfig;
        this.logs = logs;
        this.sequelize = null;

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
        this.loggers.collector.info('Collectors run');
    }

    stop() {
        this.#stopCollectors();
        this.loggers.collector.info('Collector stopped');
    }

  #initCollectors() {
        const { exchangesConfig, collectors, sequelize } = this;

        // eslint-disable-next-line guard-for-in
        for (const exchange in exchangesConfig) {
            for (const symbol of exchangesConfig[exchange].symbols) {
                const orderBook = new OrderBookCollector({ exchange, symbol }, interval, sequelize);
                // const ticker = new TickerBookCollector({ exchange, market }, dbConfig, logs);
                // const trade = new TradeBookCollector({ exchange, market }, dbConfig, logs);
                // const candleStick = new CandleStickBookCollector({ exchange, market }, dbConfig, logs);

                collectors.push(orderBook);
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
