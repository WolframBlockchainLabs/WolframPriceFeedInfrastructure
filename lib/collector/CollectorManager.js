
import { initLogger }           from '../infrastructure/logger/logger.js';
import * as DomainModel         from '../domain-model/index.js';
import { OrderBookCollector }   from './OrderBook.js';
import { TradeCollector }       from './Trade.js';
import { TickerCollector }      from './Ticker.js';
import { CandleStickCollector } from './CandleStick.js';
import { MarketService }        from './marketService.js';


export class CollectorManager {
    constructor({ collectorManager, db: dbConfig, logs }) {
        this.exchangesConfig = collectorManager.exchanges;
        this.collectors = [];
        this.dbConfig = dbConfig;
        this.logs = logs;
        this.sequelize = null;
        this.interval = collectorManager.interval;
        this.loggers = initLogger(this.logs);
    }


    async start() {
        await this.initDb();
        await this.#initCollectors();
        this.#runCollectors();
        this.loggers.collector.info(`Collectors run with ${this.interval} ms interval`);
    }

    stop() {
        this.#stopCollectors();
        this.loggers.collector.info('Collector stopped');
    }

    async #initCollectors() {
        const { exchangesConfig, collectors, sequelize, interval } = this;

        const market = new MarketService(sequelize);

        // eslint-disable-next-line guard-for-in
        for (const exchange in exchangesConfig) {
            for (const symbol of exchangesConfig[exchange].symbols) {
                const { marketId } = await market.getMarketInfo(exchange, symbol);

                const orderBook = new OrderBookCollector({ exchange, symbol }, interval, sequelize, marketId);

                const trade = new TradeCollector({ exchange, symbol }, interval, sequelize, marketId);

                const ticker = new TickerCollector({ exchange, symbol }, interval, sequelize, marketId);

                const candleStick = new CandleStickCollector({ exchange, symbol }, interval, sequelize, marketId);

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
