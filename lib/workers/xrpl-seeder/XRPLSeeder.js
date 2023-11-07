import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';

class XRPLSeeder extends BaseWorker {
    async execute({ exchange, markets }) {
        this.logger.info(`Setting up [${exchange.name}] exchange`);

        const [storedExchange, created] = await Exchange.findOrCreate({
            where: {
                externalExchangeId: exchange.id,
            },
            defaults: {
                name: exchange.name,
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
            const { symbol } = market;

            const tokenDetails = this.extractTokenDetails(symbol);

            const [storedMarket, created] = await Market.findOrCreate({
                where: {
                    symbol,
                    exchangeId: exchange.id,
                },
                defaults: {
                    externalMarketId: symbol,
                    base: tokenDetails.base.tokenName,
                    quote: tokenDetails.counter.tokenName,
                    baseId: tokenDetails.base.id,
                    quoteId: tokenDetails.counter.id,
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

    extractTokenDetails(symbol) {
        const [base, counter] = symbol.split('/').map((part) => {
            const [issuerName, tokenName] = part.split(':');

            return {
                issuerName: issuerName,
                tokenName: tokenName || issuerName,
                id: part,
            };
        });

        return { base, counter };
    }
}

export default XRPLSeeder;
