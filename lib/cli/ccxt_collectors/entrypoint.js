import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const { exchanges, interval, desync } = program.opts();
    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));
    const parsedInterval = interval.slice(1, -1);
    const parsedDesync = parseInt(desync.slice(1, -1));

    for (const exchange of parsedExchanges) {
        for (const symbol of exchange.symbols) {
            runCollectors({
                exchange: exchange.id,
                symbol,
                interval: parsedInterval,
                desync: parsedDesync,
                logger: provider.logger,
                amqpClient: provider.amqpClient,
            });
        }
    }
});

provider.start();
