import config               from '../configCollector.cjs';
import * as DomainModel     from '../domain-model/index.js';
import { initLogger }       from '../infrastructure/logger/logger.js';
import { CollectorManager } from './CollectorManager.js';
import { MarketService }    from './marketService.js';

(async function main() {
    const logger = initLogger(config.logs);

    if (!process.argv[2].includes('--exchange')) {
        logger.collector.info("'exchange' flag is required", process.argv);

        return;
    }

    const exchange = process.argv[2].split('=')[1];

    const { symbols } = config.collectorManager.exchanges[exchange];

    const sequelize = DomainModel.initModels(config.db);


    const marketService = new MarketService(sequelize);


    const collector = new CollectorManager({
        sequelize,
        marketService
    });

    try {
        await collector.process(exchange, symbols);

        logger.collector.info('Collector finish');
    } catch (error) {
        logger.collector.error(`Collector finished with ${error.message}`);
    }
}());
