import { dumpExchange }                                                                                        from '../lib/use-cases/utils/dumps.js';
import { exchangeData, fakeMarketData, orderBookData, tickerData, generateCandleStickData, generateTradeData } from './test-data.js';
import Exchange                                                                                                from './../lib/domain-model/Exchange.js';
import Market                                                                                                  from './../lib/domain-model/Market.js';
import OrderBook                                                                                               from './../lib/domain-model/OrderBook.js';
import Trade                                                                                                   from './../lib/domain-model/Trade.js';
import Ticker                                                                                                  from './../lib/domain-model/Ticker.js';
import CandleStick                                                                                             from './../lib/domain-model/CandleStick.js';

export default class TestFactory {
    async createExchanges(data = exchangeData) {
        try {
            for (const exchange of data) {
                await Exchange.create({ externalExchangeId: exchange.externalExchangeId, name: exchange.name });
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
        const exchanges = await this.createExchanges(exchangeData);

        const marketsData = fakeMarketData();

        for (const exchange of exchanges) {
            for (const market of marketsData) {
                console.log(market);
                console.log(exchange.id);
                await Market.create({ externalMarketId : market.externalMarketId,
                    symbol           : market.symbol,
                    base             : market.base,
                    quote            : market.quote,
                    baseId           : market.baseId,
                    quoteId          : market.quoteId,
                    active           : market.active,
                    exchangeId       : exchange.id });
                // await Market.create({ ...market, exchangeId: exchange.id });
            }
        }

        const markets = await Market.findAll();

        console.log('MARKETS', markets);

        return markets;
    }

    async createOrderBook() {
        const markets = await this.createMarkets();

        const { bids, asks } = orderBookData;


        for (const market of markets) {
            console.log('running');
            await OrderBook.create({ marketId: market.id, bids, asks });
        }

        const test = await OrderBook.findAll();

        console.log('test---', test);
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
