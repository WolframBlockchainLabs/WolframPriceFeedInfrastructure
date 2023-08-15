import CollectorsManager from '../../collectors/CollectorsManager.js';
import ethDrivers from '../../collectors/integrations/eth/driver/index.js';
import ExchangeRateCollector from '../../collectors/models/ExchangeRate.js';

async function runCollectors({
    exchange,
    providerUrl,
    pair,
    symbol,
    queuePosition,
    queueSize,
    replicaSize,
    instancePosition,
    rateLimit,
    rateLimitMargin,
    logger,
    amqpClient,
}) {
    const exchangeAPI = new ethDrivers[exchange](providerUrl);

    const collectorsManager = new CollectorsManager({
        models: [ExchangeRateCollector],
        logger,
        exchange,
        symbol,
        pair,
        exchangeAPI,
        amqpClient,
        rateLimit,
        rateLimitMargin,
        queuePosition,
        queueSize,
        replicaSize,
        instancePosition,
    });

    await collectorsManager.start();
}

export default runCollectors;
