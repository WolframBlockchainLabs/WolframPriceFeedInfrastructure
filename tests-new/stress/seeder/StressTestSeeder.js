import Exchange from '../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../lib/domain-model/entities/Market.js';
import OrderBook from '../../../lib/domain-model/entities/market-records/OrderBook.js';
import Trade from '../../../lib/domain-model/entities/market-records/Trade.js';
import Ticker from '../../../lib/domain-model/entities/market-records/Ticker.js';
import CandleStick from '../../../lib/domain-model/entities/market-records/CandleStick.js';
import ExchangeRate from '../../../lib/domain-model/entities/market-records/ExchangeRate.js';
import {
    exchangeData,
    getCollectorsMetaInfos,
    marketsData,
} from './test-data.js';
import dumpMarket from '../../../lib/use-cases/utils/dumps/dumpMarket.js';
import dumpExchange from '../../../lib/use-cases/utils/dumps/dumpExchange.js';

class StressTestSeeder {
    constructor(logger) {
        this.logger = logger;
    }

    async execute() {
        this.logger.info('[StressTestSeeder] executing');
        const exchanges = await this.createExchanges();
        const markets = await this.createMarkets(exchanges);
        this.logger.info('[StressTestSeeder] exchanges & markets created');

        await this.populateCollectedData(markets);
        this.logger.info('[StressTestSeeder] finished');
    }

    async createExchanges() {
        const exchanges = await Exchange.bulkCreate(exchangeData);

        return exchanges.map((exchange) => {
            return dumpExchange(exchange);
        });
    }

    async createMarkets(exchanges) {
        const bulkPayload = [];

        for (const exchange of exchanges) {
            for (const market of marketsData) {
                bulkPayload.push({
                    ...market,
                    exchangeId: exchange.id,
                });
            }
        }

        const markets = await Market.bulkCreate(bulkPayload);

        return markets.map((market) => {
            return dumpMarket(market);
        });
    }

    async createCollectorsData({ markets, rawData, Model }) {
        const bulkPayload = [];

        for (const market of markets) {
            for (const item of rawData) {
                bulkPayload.push({
                    ...item,
                    marketId: market.id,
                });
            }
        }

        return Model.bulkCreate(bulkPayload);
    }

    async populateCollectedData(markets) {
        const collectorsMetaInfos = getCollectorsMetaInfos(markets, 100);

        for (const collectorsMetaInfo of collectorsMetaInfos) {
            await this.createCollectorsData(collectorsMetaInfo);

            this.logger.info(
                `[StressTestSeeder] ${collectorsMetaInfo.Model.name}s have been saved`,
            );
        }
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

export default StressTestSeeder;
