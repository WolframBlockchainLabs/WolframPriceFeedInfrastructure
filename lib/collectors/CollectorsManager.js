import Exchange from '../domain-model/entities/Exchange.js';
import Market from '../domain-model/entities/Market.js';
import CandleStickCollector from './models/CandleStick.js';
import OrderBookCollector from './models/OrderBook.js';
import TickerCollector from './models/Ticker.js';
import TradeCollector from './models/Trade.js';

class CollectorsManager {
    constructor({ logger, exchange, symbol, exchangeAPI }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.exchangeAPI = exchangeAPI;
    }

    async start() {
        await this.init();

        try {
            await Promise.all([
                this.orderBook.start(),
                this.trade.start(),
                this.ticker.start(),
                this.candleStick.start(),
            ]);
        } catch (error) {
            this.logger.error({
                message: `'${this.exchange} & ${this.symbol}' Collector failed ${error.message}`,
                error,
            });
        }
    }

    async init() {
        await this.loadContext();

        this.buildCollectors();
    }

    async loadContext() {
        const storedExchange = await Exchange.findOne({
            where: { externalExchangeId: this.exchange },
        });

        const storedMarket = await Market.findOne({
            where: { exchangeId: storedExchange.id, symbol: this.symbol },
        });

        this.marketId = storedMarket.id;
    }

    buildCollectors() {
        const collectorConfig = {
            logger: this.logger,
            exchange: this.exchange,
            symbol: this.symbol,
            marketId: this.marketId,
            exchangeAPI: this.exchangeAPI,
        };

        this.orderBook = new OrderBookCollector(collectorConfig);
        this.trade = new TradeCollector(collectorConfig);
        this.ticker = new TickerCollector(collectorConfig);
        this.candleStick = new CandleStickCollector(collectorConfig);
    }
}

export default CollectorsManager;
