import CollectorsManager from '../../collectors/CollectorsManager.js';
import ExchangeRateCollector from '../../collectors/models/ExchangeRate.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class UDEXCollectorsRunner extends BaseCLIRunner {
    optionsValidationRules = {
        apiKey: ['required', 'string'],
        exchanges: ['required', 'string'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

    getExchangeApi() {
        throw new Error('exchangeApi getter is not implemented');
    }

    async process({ options: { exchanges, ...collectorsOptions } }) {
        const parsedExchanges = JSON.parse(exchanges.slice(1, -1));

        const queueSize = parsedExchanges.reduce(
            (acc, exchange) => acc + exchange.markets.length,
            0,
        );

        let queuePosition = 0;

        for (let i = 0; i < parsedExchanges.length; i++) {
            for (let j = 0; j < parsedExchanges[i].markets.length; j++) {
                await this.runCollectors({
                    exchange: parsedExchanges[i].id,
                    pair: parsedExchanges[i].markets[j].pair,
                    symbol: parsedExchanges[i].markets[j].symbol,
                    queuePosition,
                    queueSize,
                    logger: this.logger,
                    amqpClient: this.amqpClient,
                    ...collectorsOptions,
                });

                queuePosition++;
            }
        }
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
