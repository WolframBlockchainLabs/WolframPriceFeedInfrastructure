import { program } from 'commander';
import AppCliProvider from '../../AppCliProvider.js';
import startCollectors from './start_collectors.js';
import './options_schema.js';

function entrypoint({ exchange, symbol, interval, logger }) {
    setInterval(async () => {
        try {
            await startCollectors({
                logger,
                exchange,
                symbol,
            });
        } catch (error) {
            logger.error({
                message: `'${exchange} & ${symbol}' Collector failed ${error.message}`,
                error,
            });
        }
    }, interval);
}

const provider = new AppCliProvider(async () => {
    const { exchange, symbol, interval } = program.opts();
    const desyncTimeout = Math.floor(Math.random() * (interval / 2));

    setTimeout(() => {
        entrypoint({ exchange, symbol, interval, logger: provider.logger });
    }, desyncTimeout);
});

provider.start();
