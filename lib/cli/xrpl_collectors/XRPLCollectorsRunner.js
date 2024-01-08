import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import XRPLDriver from '#domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '#domain-collectors/integrations/xrpl/collectors/XRPLOrderBook.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import StableRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/StableRealtimeScheduler.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import MarketsManager from '#domain-collectors/MarketsManager.js';
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

        const marketsManager = this.initMarketsManager({
            markets,
            exchange,
            exchangeAPI,
            schedulerOptions,
        });

        return marketsManager.start();
    }

    initMarketsManager({ markets, exchange, exchangeAPI, schedulerOptions }) {
        const schedulersFactory = new GenericClassFactory({
            Class: StableRealtimeScheduler,
            defaultOptions: { logger: this.logger, ...schedulerOptions },
        });

        const collectorsManagersFactory = new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [XRPLOrderBookCollector],
                exchange: exchange.id,
                logger: this.logger,
                amqpClient: this.amqpClient,
                exchangeAPI,
            },
        });

        return new MarketsManager({
            markets,
            logger: this.logger,
            amqpClient: this.amqpClient,
            rabbitGroupName: exchange.id,
            schedulersFactory,
            collectorsManagersFactory,
        });
    }
}

export default XRPLCollectorsRunner;
