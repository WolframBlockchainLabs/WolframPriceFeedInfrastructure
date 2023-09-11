import CollectorsManager from '../../collectors/CollectorsManager.js';
import XRPLDriver from '../../collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '../../collectors/integrations/xrpl/models/XRPLOrderBook.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class XRPLCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        serverUrl: ['required', 'string'],
        exchange: ['required', 'string', 'json'],
        markets: ['required', 'string', 'json'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    async process({
        options: { markets, exchange, serverUrl, ...collectorsOptions },
    }) {
        const exchangeAPI = new XRPLDriver(serverUrl);
        await exchangeAPI.connect();

        for (let i = 0; i < markets.length; i++) {
            await this.runCollectors({
                exchange: exchange.id,
                pair: markets[i].pair,
                symbol: markets[i].symbol,
                queuePosition: i,
                queueSize: markets.length,
                logger: this.logger,
                amqpClient: this.amqpClient,
                exchangeAPI,
                ...collectorsOptions,
            });
        }
    }

    async runCollectors(collectorsOptions) {
        const collectorsManager = new CollectorsManager({
            models: [XRPLOrderBookCollector],
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default XRPLCollectorsRunner;
