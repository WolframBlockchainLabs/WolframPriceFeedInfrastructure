import CandleStickFactory from '../../e2e/factories/market-records/CandleStickFactory.js';
import ExchangeRateFactory from '../../e2e/factories/market-records/ExchangeRateFactory.js';
import OrderBookFactory from '../../e2e/factories/market-records/OrderBookFactory.js';
import TickerFactory from '../../e2e/factories/market-records/TickerFactory.js';
import TradeFactory from '../../e2e/factories/market-records/TradeFactory.js';
import BaseMarketRecordStory from '../../e2e/stories/market-records/BaseMarketRecordStory.js';

class StressTestSeeder {
    constructor({ logger, sequelize, config }) {
        this.sequelize = sequelize;
        this.logger = logger;
        this.config = config;

        this.marketRecordStory = new BaseMarketRecordStory();
        this.MarketRecordFactories = [
            CandleStickFactory,
            ExchangeRateFactory,
            OrderBookFactory,
            TickerFactory,
            TradeFactory,
        ];
    }

    async execute() {
        this.logger.info('[StressTestSeeder] executing');

        const { markets } = await this.marketRecordStory.setupMarkets();
        this.logger.info('[StressTestSeeder] exchanges & markets created');

        await this.populateCollectedData(markets);
        this.logger.info('[StressTestSeeder] finished');
    }

    async populateCollectedData(markets) {
        for (const MarketRecordFactory of this.MarketRecordFactories) {
            const marketRecordFactory = new MarketRecordFactory();

            await marketRecordFactory.create({ markets });

            this.logger.info(
                `[StressTestSeeder] ${MarketRecordFactory.name}s have been created`,
            );
        }
    }

    async resetDatabase() {
        const modelsToTruncate = Object.values(this.sequelize.models).filter(
            (model) => model.name !== 'SequelizeMeta',
        );

        const truncationPromises = Object.values(modelsToTruncate).map(
            async (model) => {
                await this.sequelize.query(
                    `TRUNCATE TABLE "${model.tableName}" RESTART IDENTITY CASCADE;`,
                );
            },
        );

        return Promise.all(truncationPromises);
    }
}

export default StressTestSeeder;
