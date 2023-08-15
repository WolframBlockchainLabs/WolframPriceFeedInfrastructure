import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const {
        serverUrl,
        exchange,
        markets,
        rateLimit,
        rateLimitMargin,
        replicaSize,
        instancePosition,
    } = program.opts();

    const parsedMarkets = JSON.parse(markets.slice(1, -1));
    const parsedExchange = JSON.parse(exchange.slice(1, -1));
    const parsedServerUrl = serverUrl.slice(1, -1);

    const parsedRateLimit = parseInt(rateLimit.slice(1, -1));
    const parsedRateLimitMargin = parseInt(rateLimitMargin.slice(1, -1));
    const parsedReplicaSize = parseInt(replicaSize.slice(1, -1));
    const parsedInstancePosition = parseInt(instancePosition.slice(1, -1));

    for (let i = 0; i < parsedMarkets.length; i++) {
        runCollectors({
            exchange: parsedExchange.id,
            serverUrl: parsedServerUrl,
            pair: parsedMarkets[i].pair,
            symbol: parsedMarkets[i].symbol,
            queuePosition: i,
            queueSize: parsedMarkets.length,
            replicaSize: parsedReplicaSize,
            instancePosition: parsedInstancePosition,
            rateLimit: parsedRateLimit,
            rateLimitMargin: parsedRateLimitMargin,
            logger: provider.logger,
            amqpClient: provider.amqpClient,
        });
    }
});

provider.start();
