import { program }       from 'commander';
import * as DomainModel  from '../domain-model/index.js';
import { initLogger }    from '../infrastructure/logger/logger.js';
import config            from './configCollector.cjs';
import startCollectors   from './startCollectors.js';
import { MarketService } from './marketService.js';

program
    .version('1.0.0')
    .description('A CLI for running collectors')
    .allowExcessArguments(false)
    .allowUnknownOption(false)
    .requiredOption('-e, --exchange <value>', 'Exchange name')
    .requiredOption('-s, --symbol <value>', 'Symbol name')
    .requiredOption('-i, --interval <value>', 'Interval duration');

const { exchange, symbol, interval } = program.opts();

(async function main() {
    const logger = initLogger(config.logs);
    const sequelize = DomainModel.initModels(config.db);

    const marketService = new MarketService(sequelize);

    try {
        setInterval(async () => {
            await startCollectors({ exchange, symbol, marketService, sequelize });
        }, interval);
    } catch (error) {
        logger.collector.error(`Collector finished with ${error.message}`);
    }
}());
