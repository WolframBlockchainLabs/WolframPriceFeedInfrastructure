import XRPLCollectorsManager from '../../collectors/integrations/xrpl/XRPLCollectorsManager.js';
import XRPLDriver from '../../collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '../../collectors/integrations/xrpl/models/XRPLOrderBook.js';

async function runCollectors({
    exchange,
    serverUrl,
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
    const exchangeAPI = new XRPLDriver(serverUrl);

    const collectorsManager = new XRPLCollectorsManager({
        models: [XRPLOrderBookCollector],
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
