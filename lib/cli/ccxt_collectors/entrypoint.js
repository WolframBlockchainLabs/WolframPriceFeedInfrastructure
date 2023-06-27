import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const { exchange, symbol, interval } = program.opts();
    const desyncTimeout = Math.floor(Math.random() * (interval / 2));

    setTimeout(() => {
        runCollectors({
            exchange,
            symbol,
            interval,
            logger: provider.logger,
            config: provider.config,
        });
    }, desyncTimeout);
});

provider.start();
