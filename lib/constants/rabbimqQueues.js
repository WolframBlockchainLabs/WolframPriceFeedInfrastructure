export const DATABASE_WRITER_QUEUES = {
    candleStick: 'database-writer.candle-stick',
    orderBook: 'database-writer.order-book',
    ticker: 'database-writer.ticker',
    trade: 'database-writer.trade',
    exchangeRate: 'database-writer.exchange-rate',
};

export const WS_PRICING_QUEUE = 'ws.pricing-notifications';

export const AGGREGATOR_QUEUES = {
    candleStick: {
        discrete: 'aggregator.candle-stick.discrete',
        complete: 'aggregator.candle-stick.complete',
    },
};
