import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const {
        providerUrl,
        exchanges,
        rateLimit,
        rateLimitMargin,
        replicaSize,
        instancePosition,
    } = program.opts();

    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));
    const parsedProviderUrl = providerUrl.slice(1, -1);

    const parsedRateLimit = parseInt(rateLimit.slice(1, -1));
    const parsedRateLimitMargin = parseInt(rateLimitMargin.slice(1, -1));
    const parsedReplicaSize = parseInt(replicaSize.slice(1, -1));
    const parsedInstancePosition = parseInt(instancePosition.slice(1, -1));

    const queueSize = parsedExchanges.reduce(
        (acc, exchange) => acc + exchange.markets.length,
        0,
    );

    let queuePosition = 0;

    for (let i = 0; i < parsedExchanges.length; i++) {
        for (let j = 0; j < parsedExchanges[i].markets.length; j++) {
            runCollectors({
                exchange: parsedExchanges[i].id,
                providerUrl: parsedProviderUrl,
                pair: parsedExchanges[i].markets[j].pair,
                symbol: parsedExchanges[i].markets[j].symbol,
                queuePosition,
                queueSize,
                replicaSize: parsedReplicaSize,
                instancePosition: parsedInstancePosition,
                rateLimit: parsedRateLimit,
                rateLimitMargin: parsedRateLimitMargin,
                logger: provider.logger,
                amqpClient: provider.amqpClient,
            });

            queuePosition++;
        }
    }
});

provider.start();
