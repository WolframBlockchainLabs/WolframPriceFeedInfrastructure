import CCXTSeeder from '../../../../lib/workers/ccxt-seeder/CCXTSeeder.js';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';

jest.mock('ccxt', () => ({
    binance: jest.fn().mockImplementation(function () {
        return {
            loadMarkets: jest.fn().mockResolvedValue({ 'BTC/EUR': {} }),
        };
    }),
}));

describe('[ccxt-seeder]: CCXTSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.ExchangeStub = {
            findOrCreate: jest
                .spyOn(Exchange, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.MarketStub = {
            findOrCreate: jest
                .spyOn(Market, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };

        context.ccxtSeeder = new CCXTSeeder({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was created', async () => {
        const loadMarketsSpy = jest
            .spyOn(context.ccxtSeeder, 'loadMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was found', async () => {
        context.ExchangeStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);
        const loadMarketsSpy = jest
            .spyOn(context.ccxtSeeder, 'loadMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method tries to create a market if they are not found', async () => {
        await context.ccxtSeeder.loadMarkets(
            {
                externalExchangeId: 'binance',
                name: 'Binance',
            },
            ['BTC/EUR'],
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method will not create market if it was found', async () => {
        context.MarketStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);

        await context.ccxtSeeder.loadMarkets(
            {
                externalExchangeId: 'binance',
                name: 'Binance',
            },
            ['BTC/EUR'],
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
