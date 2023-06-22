import {
    exchangeData,
    marketData,
    orderBookData,
    tickerData,
    generateCandleStickData,
    generateTradeData,
} from './test-data.js';
import Exchange from '../lib/domain-model/entities/Exchange.js';
import Market from '../lib/domain-model/entities/Market.js';
import OrderBook from '../lib/domain-model/entities/OrderBook.js';
import Trade from '../lib/domain-model/entities/Trade.js';
import Ticker from '../lib/domain-model/entities/Ticker.js';
import CandleStick from '../lib/domain-model/entities/CandleStick.js';

export default class TestFactory {
    async createExchange() {
        const exchange = await Exchange.create(exchangeData);

        return exchange;
    }

    async createMarket() {
        const { id: exchangeId, name: exchangeName } =
            await this.createExchange();

        const { id: marketId, symbol } = await Market.create({
            ...marketData,
            exchangeId,
        });

        return { marketId, symbol, exchangeName };
    }

    async createOrderBook() {
        const { marketId, symbol, exchangeName } = await this.createMarket();
        const { bids, asks } = orderBookData;

        const newOrderBook = await OrderBook.create({ marketId, bids, asks });

        return { exchangeName, marketId, symbol, newOrderBook };
    }

    async createCandleStick() {
        const { marketId, symbol, exchangeName } = await this.createMarket();
        const charts = generateCandleStickData();

        const newCandleStick = await CandleStick.create({ marketId, charts });

        return { exchangeName, marketId, symbol, newCandleStick };
    }

    async createTicker() {
        const { marketId, symbol, exchangeName } = await this.createMarket();

        const newTicker = await Ticker.create({ marketId, ...tickerData });

        return { exchangeName, marketId, symbol, newTicker };
    }

    async createTrade() {
        const { marketId, symbol, exchangeName } = await this.createMarket();

        const tradesInfo = generateTradeData();

        const newTrade = await Trade.create({ marketId, tradesInfo });

        return { exchangeName, marketId, symbol, newTrade };
    }

    async cleanup() {
        await Trade.destroy({ truncate: { cascade: true } });
        await Ticker.destroy({ truncate: { cascade: true } });
        await CandleStick.destroy({ truncate: { cascade: true } });
        await OrderBook.destroy({ truncate: { cascade: true } });
        await Market.destroy({ truncate: { cascade: true } });
        await Exchange.destroy({ truncate: { cascade: true } });
    }
}
