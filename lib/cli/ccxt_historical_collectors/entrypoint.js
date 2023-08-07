import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const {
        exchanges,
        rateLimit,
        rateLimitMargin,
        scheduleStartDate,
        scheduleEndDate,
    } = program.opts();
    if (
        isNaN(new Date(scheduleStartDate)) ||
        isNaN(new Date(scheduleEndDate))
    ) {
        throw new Error('Invalid date');
    }

    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));
    const parsedRateLimit = parseInt(rateLimit);
    const parsedRateLimitMargin = parseInt(rateLimitMargin);

    const collectorPromises = [];

    for (const exchange of parsedExchanges) {
        for (let i = 0; i < exchange.symbols.length; i++) {
            const runCollectorsPromise = runCollectors({
                scheduleStartDate,
                scheduleEndDate,
                exchange: exchange.id,
                symbol: exchange.symbols[i],
                queuePosition: i,
                queueSize: exchange.symbols.length,
                defaultRateLimit: parsedRateLimit,
                enforcedRateLimit: exchange.rateLimit,
                rateLimitMargin: parsedRateLimitMargin,
                logger: provider.logger,
                amqpClient: provider.amqpClient,
            });

            collectorPromises.push(runCollectorsPromise);
        }
    }

    await Promise.all(collectorPromises);

    await provider.shutdown();
});

provider.start();
