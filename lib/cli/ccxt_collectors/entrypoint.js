import { program }     from 'commander';
import AppCliProvider  from '../../AppCliProvider.js';
import startCollectors from './start_collectors.js';
import './options_schema.js';

const provider = AppCliProvider.create();

provider.initApp(async () => {
    const { exchange, symbol, interval } = program.opts();

    setInterval(async () => {
        try {
            await startCollectors({ exchange, symbol });
        } catch (error) {
            provider.loggers.collector.error(`Collector finished with ${error.message}`);
        }
    }, interval);
}).start();
