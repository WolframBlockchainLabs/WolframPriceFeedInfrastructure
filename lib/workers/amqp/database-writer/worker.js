import AppAMQPProvider from '../AppAMQPProvider.js';
import CandleStickWriter from './CandleStickWriter.js';
import OrderBookWriter from './OrderBookWriter.js';
import TickerWriter from './TickerWriter.js';
import TradeWriter from './TradeWriter.js';
import ExchangeRateWriter from './ExchangeRateWriter.js';
import { DATABASE_WRITER_QUEUES } from '#constants/amqp/rabbit-queues.js';

const provider = new AppAMQPProvider({
    candleStick: {
        queue: DATABASE_WRITER_QUEUES.candleStick,
        ConsumerClass: CandleStickWriter,
    },
    orderBook: {
        queue: DATABASE_WRITER_QUEUES.orderBook,
        ConsumerClass: OrderBookWriter,
    },
    ticker: {
        queue: DATABASE_WRITER_QUEUES.ticker,
        ConsumerClass: TickerWriter,
    },
    trade: {
        queue: DATABASE_WRITER_QUEUES.trade,
        ConsumerClass: TradeWriter,
    },
    exchangeRate: {
        queue: DATABASE_WRITER_QUEUES.exchangeRate,
        ConsumerClass: ExchangeRateWriter,
    },
});

provider.start();
