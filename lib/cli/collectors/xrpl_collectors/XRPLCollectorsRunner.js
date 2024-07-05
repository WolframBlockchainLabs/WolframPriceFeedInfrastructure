import CollectorsManager from '#domain-collectors/CollectorsManager.js';
import XRPLDriver from '#domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import XRPLOrderBookCollector from '#domain-collectors/integrations/xrpl/collectors/XRPLOrderBook.js';
import RestrictedRealtimeScheduler from '#domain-collectors/infrastructure/schedulers/RestrictedRealtimeScheduler.js';
import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory.js';
import MarketsManager from '#domain-collectors/MarketsManager.js';
import BaseCollectorsRunner from '../BaseCollectorsRunner.js';
import xrplCollectorsConfig from '#configs/xrplCollectorsConfig.cjs';

class XRPLCollectorsRunner extends BaseCollectorsRunner {
    RABBIT_GROUP_NAME = 'xrpl';

    async process() {
        const { serverUrl, exchange, ...schedulerOptions } =
            xrplCollectorsConfig;

        const marketsManagerFactory = await this.getMarketsManagerFactory({
            serverUrl,
            schedulerOptions,
        });

        await this.initMarketsAMQPManager({
            marketsManagerFactory,
            logger: this.logger,
            amqpClient: this.amqpClient,
            externalExchangeId: exchange.id,
            policiesConfigs: this.config.policiesConfigs,
        });
    }

    async getMarketsManagerFactory({ serverUrl, schedulerOptions }) {
        const exchangeAPI = await this.initDriver(serverUrl);

        const schedulersFactory = new GenericClassFactory({
            Class: RestrictedRealtimeScheduler,
            defaultOptions: schedulerOptions,
        });

        const collectorsManagersFactory = new GenericClassFactory({
            Class: CollectorsManager,
            defaultOptions: {
                models: [XRPLOrderBookCollector],
                exchangeAPI,
            },
        });

        return new GenericClassFactory({
            Class: MarketsManager,
            defaultOptions: {
                schedulersFactory,
                collectorsManagersFactory,
            },
        });
    }

    async initDriver(serverUrl) {
        const exchangeAPI = new XRPLDriver(serverUrl);

        await exchangeAPI.connect();

        return exchangeAPI;
    }
}

export default XRPLCollectorsRunner;
