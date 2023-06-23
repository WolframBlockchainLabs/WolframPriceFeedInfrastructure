import { program } from 'commander';
import AppCliProvider from '../../AppCliProvider.js';
import startCollectors from './start_collectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const { exchange, symbol, interval } = program.opts();

    setInterval(async () => {
        try {
            await startCollectors({
                logger: provider.logger,
                exchange,
                symbol,
            });
        } catch (error) {
            provider.logger.error(`Collector finished with ${error.message}`);
        }
    }, interval);
});

provider.start();
