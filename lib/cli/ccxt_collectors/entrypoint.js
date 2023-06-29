import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const { exchanges, interval } = program.opts();
    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));

    for (const exchange of parsedExchanges) {
        for (const symbol of exchange.symbols) {
            const desyncTimeout = Math.floor(Math.random() * (interval / 2));

            setTimeout(() => {
                runCollectors({
                    exchange: exchange.id,
                    symbol,
                    interval,
                    logger: provider.logger,
                    amqpClient: provider.amqpClient,
                });
            }, desyncTimeout);
        }
    }
});

provider.start();
