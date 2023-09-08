import { program } from 'commander';
import AppCliProvider from '../AppCLIProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const {
        exchanges,
        rateLimit,
        rateLimitMargin,
        replicaSize,
        instancePosition,
    } = program.opts();

    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));
    const parsedRateLimit = parseInt(rateLimit.slice(1, -1));
    const parsedRateLimitMargin = parseInt(rateLimitMargin.slice(1, -1));
    const parsedReplicaSize = parseInt(replicaSize.slice(1, -1));
    const parsedInstancePosition = parseInt(instancePosition.slice(1, -1));

    for (const exchange of parsedExchanges) {
        for (let i = 0; i < exchange.symbols.length; i++) {
            runCollectors({
                exchange: exchange.id,
                symbol: exchange.symbols[i],
                queuePosition: i,
                queueSize: exchange.symbols.length,
                replicaSize: parsedReplicaSize,
                instancePosition: parsedInstancePosition,
                defaultRateLimit: parsedRateLimit,
                enforcedRateLimit: exchange.rateLimit,
                rateLimitMargin: parsedRateLimitMargin,
                logger: provider.logger,
                amqpClient: provider.amqpClient,
            });
        }
    }
});

provider.start();
