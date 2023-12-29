import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import XRPLDriver from '#domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '#domain-collectors/integrations/xrpl/collectors/XRPLOrderBook.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import StableRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/StableRealtimeScheduler.js';
import './options_schema.js';

class XRPLCollectorsRunner extends BaseCLIRunner {
    RABBIT_GROUP_NAME = 'xrpl';

    optionsValidationRules = {
        serverUrl: ['required', 'string'],
        exchange: ['required', 'string', 'json'],
        markets: ['required', 'string', 'json'],
        baseRateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    async process({
        options: { markets, exchange, serverUrl, ...schedulerOptions },
    }) {
        const exchangeAPI = new XRPLDriver(serverUrl);
        await exchangeAPI.connect();

        const collectorPromises = markets.map((market, queuePosition) => {
            const collectorsScheduler = new StableRealtimeScheduler({
                taskName: `${exchange.id}::${market.symbol}`,
                logger: this.logger,
                queuePosition,
                queueSize: markets.length,
                ...schedulerOptions,
            });

            const collectorsManager = new CollectorsManager({
                models: [XRPLOrderBookCollector],
                exchange: exchange.id,
                pair: market.pair,
                symbol: market.symbol,
                logger: this.logger,
                amqpClient: this.amqpClient,
                collectorsScheduler,
                exchangeAPI,
                rabbitGroupName: this.RABBIT_GROUP_NAME,
            });

            return collectorsManager.start();
        });

        await Promise.all(collectorPromises);
    }
}

export default XRPLCollectorsRunner;
