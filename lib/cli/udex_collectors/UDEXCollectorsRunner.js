import CollectorsManager from '../../domain-collectors/CollectorsManager.js';
import ExchangeRateCollector from '../../domain-collectors/collectors/ExchangeRateCollector.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class UDEXCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        apiKey: ['required', 'string'],
        exchanges: ['required', 'string', 'json'],
        baseRateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    getExchangeApi() {
        throw new Error('exchangeApi getter is not implemented');
    }

    async process({ options: { exchanges, ...collectorsOptions } }) {
        const queueSize = exchanges.reduce(
            (acc, exchange) => acc + exchange.markets.length,
            0,
        );

        let queuePosition = 0;

        const collectorPromises = exchanges.flatMap((exchange) =>
            exchange.markets.map((market) => {
                return this.runCollectors({
                    exchange: exchange.id,
                    pair: market.pair,
                    symbol: market.symbol,
                    queuePosition: queuePosition++,
                    queueSize,
                    logger: this.logger,
                    amqpClient: this.amqpClient,
                    ...collectorsOptions,
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
        });

        await collectorsManager.start();
    }
}

export default UDEXCollectorsRunner;
