import MarketsRefresher from '#workers/markets-refresher/MarketsRefresher.js';
import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';

jest.mock('ccxt', () => ({
    binance: jest.fn().mockImplementation(function () {
        return {
            loadMarkets: jest.fn().mockResolvedValue({ 'BTC/EUR': {} }),
        };
    }),
}));

describe('[markets-refresher]: MarketsRefresher Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.ExchangeStub = {
            findOne: jest
                .spyOn(Exchange, 'findOne')
                .mockResolvedValue({ id: 1 }),
        };

        context.marketInstanceStub = {
            update: jest.fn(),
        };
        context.MarketStub = {
            findOne: jest
                .spyOn(Market, 'findOne')
                .mockResolvedValue(context.marketInstanceStub),
        };

        context.loggerStub = {
            info: jest.fn(),
            warning: jest.fn(),
            error: jest.fn(),
        };

        context.marketsRefresher = new MarketsRefresher({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('execute method handles errors in refreshExchange', async () => {
        const error = new Error('Exchange refresh failed');
        jest.spyOn(
            context.marketsRefresher,
            'refreshExchange',
        ).mockRejectedValue(error);

        await context.marketsRefresher.execute([
            { id: 'binance', name: 'Binance', symbols: ['BTC/EUR'] },
        ]);

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining(
                `Error refreshing [Binance] exchange: ${error.message}`,
            ),
        );
    });

    test('refreshExchange method processes exchange and calls refreshMarkets', async () => {
        await context.marketsRefresher.refreshExchange({
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        });

        expect(context.ExchangeStub.findOne).toHaveBeenCalledWith(
            expect.any(Object),
        );
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(`Refreshing [Binance] exchange`),
        );
    });

    test('refreshMarkets method processes multiple symbols', async () => {
        const exchange = { externalExchangeId: 'binance', name: 'Binance' };

        await context.marketsRefresher.refreshMarkets(exchange, [
            'BTC/EUR',
            'ETH/USD',
        ]);

        expect(context.MarketStub.findOne).toHaveBeenCalledTimes(1);
        expect(context.marketInstanceStub.update).toHaveBeenCalledTimes(1);
    });

    test('updateMarket method logs warning if market not found', async () => {
        context.MarketStub.findOne.mockResolvedValue(null);

        await context.marketsRefresher.updateMarket(
            { name: 'Binance' },
            { 'BTC/EUR': {} },
            'BTC/EUR',
        );

        expect(context.loggerStub.warning).toHaveBeenCalledWith(
            expect.stringContaining(
                `Could not find Market for [Binance & BTC/EUR]`,
            ),
        );
    });

    test('updateMarket method handles errors in market update', async () => {
        const error = new Error('Market update failed');
        context.marketInstanceStub.update.mockRejectedValue(error);

        await context.marketsRefresher.updateMarket(
            { name: 'Binance' },
            { 'BTC/EUR': {} },
            'BTC/EUR',
        );

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining(
                `Error updating market [Binance & BTC/EUR]: ${error.message}`,
            ),
        );
    });

    test('refreshExchange method logs warning if exchange is not found', async () => {
        context.ExchangeStub.findOne.mockResolvedValue(null);

        const exchangeConfig = {
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        };

        await context.marketsRefresher.refreshExchange(exchangeConfig);

        expect(context.ExchangeStub.findOne).toHaveBeenCalledWith({
            where: {
                externalExchangeId: exchangeConfig.id,
                name: exchangeConfig.name,
            },
        });
        expect(context.loggerStub.warning).toHaveBeenCalledWith(
            expect.stringContaining(
                `Could not find ${exchangeConfig.name} exchange`,
            ),
        );
    });
});
