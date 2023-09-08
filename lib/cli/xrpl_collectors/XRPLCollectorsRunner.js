import CollectorsManager from '../../collectors/CollectorsManager.js';
import XRPLDriver from '../../collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '../../collectors/integrations/xrpl/models/XRPLOrderBook.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class XRPLCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        serverUrl: ['required', 'string'],
        exchange: ['required', 'string'],
        markets: ['required', 'string'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    async process({ options: { markets, exchange, ...collectorsOptions } }) {
        const parsedMarkets = JSON.parse(markets.slice(1, -1));
        const parsedExchange = JSON.parse(exchange.slice(1, -1));

        for (let i = 0; i < parsedMarkets.length; i++) {
            this.runCollectors({
                exchange: parsedExchange.id,
                pair: parsedMarkets[i].pair,
                symbol: parsedMarkets[i].symbol,
                queuePosition: i,
                queueSize: parsedMarkets.length,
                logger: this.logger,
                amqpClient: this.amqpClient,
                ...collectorsOptions,
            });
        }
    }

    async runCollectors({ serverUrl, ...collectorsOptions }) {
        const exchangeAPI = new XRPLDriver(serverUrl);

        await exchangeAPI.connect();

        const collectorsManager = new CollectorsManager({
            models: [XRPLOrderBookCollector],
            exchangeAPI,
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default XRPLCollectorsRunner;
