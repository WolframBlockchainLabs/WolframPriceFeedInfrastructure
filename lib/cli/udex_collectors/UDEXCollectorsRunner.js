import udexCollectorsConfig from '../../configs/udexCollectorsConfig.cjs';
import CollectorsManager from '../../domain-collectors/CollectorsManager.js';
import ExchangeRateCollector from '../../domain-collectors/collectors/ExchangeRateCollector.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class UDEXCollectorsRunner extends BaseCLIRunner {
    udexCollectorsConfig = udexCollectorsConfig;

    optionsValidationRules = {
        groupName: ['required', 'string'],
    };

    async process({ options: { exchanges, apiKey, ...collectorsOptions } }) {
        const queueSize = exchanges.reduce(
            (acc, exchange) => acc + exchange.markets.length,
            0,
        );

        let queuePosition = 0;

        const collectorPromises = exchanges.flatMap((exchange) =>
            exchange.markets.map((market) => {
                return this.runCollectors({
                    apiKey,
                    exchange: exchange.id,
                    pair: market.pair,
                    symbol: market.symbol,
                    logger: this.logger,
                    amqpClient: this.amqpClient,

                    schedulerOptions: {
                        queuePosition: queuePosition++,
                        queueSize,
                        ...collectorsOptions,
                    },
                });
            }),
        );

        await Promise.all(collectorPromises);
    }

    async runCollectors({ apiKey, ...collectorsOptions }) {
        const collectorsManager = new CollectorsManager({
            models: [ExchangeRateCollector],
            exchangeAPI: this.getExchangeApi({
                exchange: collectorsOptions.exchange,
                apiKey,
            }),
            ...collectorsOptions,
            rabbitGroupName: this.RABBIT_GROUP_NAME,
        });

        await collectorsManager.start();
    }
}

export default UDEXCollectorsRunner;
