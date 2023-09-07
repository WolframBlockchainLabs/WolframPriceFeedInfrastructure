import CollectorsManager from '../../collectors/CollectorsManager.js';
import cardanoDrivers from '../../collectors/integrations/cardano/index.js';
import ExchangeRateCollector from '../../collectors/models/ExchangeRate.js';
import AppCliProvider from './AppCliProvider.js';

class CardanoCollectorsProvider extends AppCliProvider {
    optionsValidationRules = {
        projectId: ['required', 'string'],
        exchanges: ['required', 'string'],
        rateLimit: ['required', 'positive_integer'],
        rateLimitMargin: ['required', 'positive_integer'],
        replicaSize: ['required', 'positive_integer'],
        instancePosition: ['required', 'integer'],
    };

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

    async runCollectors({ projectId, ...collectorsOptions }) {
        const exchangeAPI = new cardanoDrivers[collectorsOptions.exchange]({
            projectId,
        });

        const collectorsManager = new CollectorsManager({
            models: [ExchangeRateCollector],
            exchangeAPI,
            ...collectorsOptions,
        });

        await collectorsManager.start();
    }
}

export default CardanoCollectorsProvider;
