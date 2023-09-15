import {
    exchangeData,
    fakeMarketsData,
    orderBookData,
    tickerData,
    generateCandleStickData,
    generateTradeData,
    exchangeRateData,
} from './test-data.js';
import Exchange from '../../lib/domain-model/entities/Exchange.js';
import Market from '../../lib/domain-model/entities/Market.js';
import OrderBook from '../../lib/domain-model/entities/OrderBook.js';
import Trade from '../../lib/domain-model/entities/Trade.js';
import Ticker from '../../lib/domain-model/entities/Ticker.js';
import CandleStick from '../../lib/domain-model/entities/CandleStick.js';
import dumpExchange from '../../lib/use-cases/utils/dumps/dumpExchange.js';
import dumpMarket from '../../lib/use-cases/utils/dumps/dumpMarket.js';
import ExchangeRate from '../../lib/domain-model/entities/ExchangeRate.js';

class TestFactory {
    async createExchanges() {
        try {
            for (const exchange of exchangeData) {
                await Exchange.create({
                    externalExchangeId: exchange.externalExchangeId,
                    name: exchange.name,
                });
            }

            const exchanges = await Exchange.findAll();

            return exchanges.map((exchange) => {
                return dumpExchange(exchange);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async createMarkets() {
        const exchanges = await this.createExchanges();

        const marketsData = fakeMarketsData();

        for (const [index, exchange] of exchanges.entries()) {
            await Market.create({
                ...marketsData[index],
                exchangeId: exchange.id,
            });
        }

        const createMarket = await Market.findAll();

        return createMarket.map((market) => {
            return dumpMarket(market);
        });
    }

    async findOneExchangeOrCreate() {
        try {
            const { externalExchangeId, name } = exchangeData[0];
            let exchange = await Exchange.findOne({
                where: {
                    externalExchangeId,
                    name,
                },
            });

            if (!exchange) {
                exchange = await Exchange.create({
                    externalExchangeId,
                    name,
                });
            }

            return dumpExchange(exchange);
        } catch (error) {
            console.error(error);
        }
    }

    async findOneMarketOrCreate() {
        const exchange = await this.findOneExchangeOrCreate();
        const marketData = fakeMarketsData()[0];

        let market = await Market.findOne({
            where: {
                ...marketData,
                exchangeId: exchange.id,
            },
        });

        if (!market) {
            market = await Market.create({
                ...marketData,
                exchangeId: exchange.id,
            });
        }

        return {
            marketId: market.id,
            symbol: market.symbol,
            exchangeName: exchange.name,
        };
    }

    async createOrderBook() {
        const markets = await this.createMarkets();

        const { bids, asks } = orderBookData;

        for (const market of markets) {
            await OrderBook.create({
                marketId: market.id,
                intervalStart: new Date(),
                bids,
                asks,
            });
        }
    }

    async createExchangeRate() {
        const markets = await this.createMarkets();

        for (const market of markets) {
            await ExchangeRate.create({
                marketId: market.id,
                intervalStart: new Date(),
                intervalEnd: new Date(),
                ...exchangeRateData,
            });
        }
    }

    async createCandleStick() {
        const { marketId, symbol, exchangeName } =
            await this.findOneMarketOrCreate();
        const charts = generateCandleStickData();

        const newCandleStick = await CandleStick.create({
            marketId,
            intervalStart: new Date(),
            charts,
        });

        return { exchangeName, marketId, symbol, newCandleStick };
    }

    async createTicker() {
        const { marketId, symbol, exchangeName } =
            await this.findOneMarketOrCreate();

        const newTicker = await Ticker.create({
            marketId,
            intervalStart: new Date(),
            ...tickerData,
        });

        return { exchangeName, marketId, symbol, newTicker };
    }

    async createTrade() {
        const { marketId, symbol, exchangeName } =
            await this.findOneMarketOrCreate();

        const tradesInfo = generateTradeData();

        const newTrade = await Trade.create({
            marketId,
            tradesInfo,
            intervalStart: new Date(),
        });

        return { exchangeName, marketId, symbol, newTrade };
    }

    async cleanup() {
        await Trade.destroy({ truncate: { cascade: true } });
        await Ticker.destroy({ truncate: { cascade: true } });
        await CandleStick.destroy({ truncate: { cascade: true } });
        await ExchangeRate.destroy({ truncate: { cascade: true } });
        await OrderBook.destroy({ truncate: { cascade: true } });
        await Market.destroy({ truncate: { cascade: true } });
        await Exchange.destroy({ truncate: { cascade: true } });
    }
}

export default TestFactory;
