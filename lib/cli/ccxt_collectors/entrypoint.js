import { program }       from 'commander';
import AppCliProvider    from '../../AppCliProvider.js';
import startCollectors   from '../../collectors/ccxt/startCollectors.js';
import { MarketService } from '../../collectors/MarketService.js';
import './options_schema.js';

const provider = AppCliProvider.create();

provider.initApp(async () => {
    const { exchange, symbol, interval } = program.opts();

    const sequelize = provider.sequelize;
    const marketService = new MarketService(sequelize);

    try {
        setInterval(() => {
            return startCollectors({ exchange, symbol, marketService, sequelize });
        }, interval);
    } catch (error) {
        provider.loggers.collector.error(`Collector finished with ${error.message}`);
    }
}).start();
