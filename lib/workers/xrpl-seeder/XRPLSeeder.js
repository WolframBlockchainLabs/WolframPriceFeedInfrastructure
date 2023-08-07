import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';

class XRPLSeeder extends BaseWorker {
    async execute({ exchangeConfig, markets }) {
        this.logger.info(`Setting up [${exchangeConfig.name}] exchange`);

        const [storedExchange, created] = await Exchange.findOrCreate({
            where: {
                externalExchangeId: exchangeConfig.id,
            },
            defaults: {
                name: exchangeConfig.name,
            },
        });

        this.logger.info(
            `${storedExchange.name} exchange has been ${
                created ? 'created' : 'found'
            } successfully`,
        );

        await this.loadMarkets(storedExchange, markets);
    }

    async loadMarkets(exchange, markets) {
        this.logger.info(`Loading Markets for [${exchange.name}]`);

        for (const market of markets) {
            const { pair, symbol } = market;

            const [baseId, quoteId] = symbol.split('/');

            const [storedMarket, created] = await Market.findOrCreate({
                where: {
                    symbol,
                    exchangeId: exchange.id,
                },
                defaults: {
                    externalMarketId: symbol,
                    base: pair.base.currency,
                    quote: pair.currency.currency,
                    baseId,
                    quoteId,
                },
            });

            this.logger.info(
                `Market for [${exchange.name} & ${
                    storedMarket.symbol
                }] has been ${created ? 'created' : 'found'} successfully`,
            );
        }

        this.logger.info(`All Markets for [${exchange.name}] have been loaded`);
    }
}

export default XRPLSeeder;
