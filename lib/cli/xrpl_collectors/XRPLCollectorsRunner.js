import CollectorsManager from '../../domain-collectors/CollectorsManager.js';
import XRPLDriver from '../../domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '../../domain-collectors/integrations/xrpl/models/XRPLOrderBook.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
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
        options: { markets, exchange, serverUrl, ...collectorsOptions },
    }) {
        const exchangeAPI = new XRPLDriver(serverUrl);
        await exchangeAPI.connect();

        const collectorPromises = markets.map((market, queuePosition) => {
            return this.runCollectors({
                exchange: exchange.id,
                pair: market.pair,
                symbol: market.symbol,
                queuePosition,
                queueSize: markets.length,
                logger: this.logger,
                amqpClient: this.amqpClient,
                exchangeAPI,
                ...collectorsOptions,
            });
        });

        await Promise.all(collectorPromises);
    }

    async runCollectors(collectorsOptions) {
        const collectorsManager = new CollectorsManager({
            models: [XRPLOrderBookCollector],
            ...collectorsOptions,
            rabbitGroupName: this.RABBIT_GROUP_NAME,
        });

        await collectorsManager.start();
    }
}

export default XRPLCollectorsRunner;
