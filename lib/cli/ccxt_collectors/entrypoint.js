import { program } from 'commander';
import AppCliProvider from '../AppCliProvider.js';
import runCollectors from './runCollectors.js';
import './options_schema.js';

const provider = new AppCliProvider(async () => {
    const { exchanges, rateLimit, replicaSize, instancePosition } =
        program.opts();

    const parsedExchanges = JSON.parse(exchanges.slice(1, -1));
    const parsedRateLimit = rateLimit.slice(1, -1);
    const parsedReplicaSize = replicaSize.slice(1, -1);
    const parsedInstancePosition = instancePosition.slice(1, -1);

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
                logger: provider.logger,
                amqpClient: provider.amqpClient,
            });
        }
    }
});

provider.start();
