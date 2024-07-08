import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import CCXTSeeder from '#workers/seeders/ccxt/CCXTSeeder.js';
import ccxt from 'ccxt';

jest.mock('ccxt', () => ({
    binance: jest.fn().mockImplementation(() => ({
        loadMarkets: jest.fn().mockResolvedValue({ 'BTC/EUR': {} }),
    })),
}));

describe('[ccxt-seeder]: CCXTSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.ExchangeFindOrCreateMock = jest
            .spyOn(Exchange, 'findOrCreate')
            .mockResolvedValue([
                { id: 1, name: 'Binance', externalExchangeId: 'binance' },
                true,
            ]);

        context.MarketFindOrCreateMock = jest
            .spyOn(Market, 'findOrCreate')
            .mockResolvedValue([{ id: 1, symbol: 'BTC/EUR' }, true]);

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
        };

        context.ccxtSeeder = new CCXTSeeder({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('execute method calls createExchange and loadMarkets for each exchange config', async () => {
        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.ExchangeFindOrCreateMock).toHaveBeenCalledTimes(1);
        expect(context.MarketFindOrCreateMock).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.info).toHaveBeenCalled();
    });

    test('createExchange method creates or finds an exchange', async () => {
        const exchange = await context.ccxtSeeder.createExchange({
            id: 'binance',
            name: 'Binance',
        });

        expect(exchange).toBeDefined();
        expect(context.ExchangeFindOrCreateMock).toHaveBeenCalledWith({
            where: { externalExchangeId: 'binance' },
            defaults: { name: 'Binance' },
        });
    });

    test('loadMarkets method processes each symbol and tries to create a market', async () => {
        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        await context.ccxtSeeder.loadMarkets(exchange, ['BTC/EUR']);

        expect(context.MarketFindOrCreateMock).toHaveBeenCalledTimes(1);
        expect(context.MarketFindOrCreateMock).toHaveBeenCalledWith({
            where: { symbol: 'BTC/EUR', exchangeId: exchange.id },
            defaults: expect.any(Object),
        });
    });

    test('createMarket method creates or finds a market', async () => {
        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        const currentExchangeMarkets = {
            'BTC/EUR': {
                id: 'btc-eur',
                base: 'BTC',
                quote: 'EUR',
                active: true,
            },
        };

        await context.ccxtSeeder.createMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.MarketFindOrCreateMock).toHaveBeenCalledWith({
            where: { symbol: 'BTC/EUR', exchangeId: exchange.id },
            defaults: {
                externalMarketId: 'btc-eur',
                base: 'BTC',
                quote: 'EUR',
                active: true,
            },
        });
    });

    test('execute method logs an error if creating an exchange fails', async () => {
        context.ExchangeFindOrCreateMock.mockRejectedValue(
            new Error('Creation failed'),
        );

        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining('Error setting up [Binance] exchange'),
        );
    });

    test('loadMarkets method logs an error if exchangeAPI.loadMarkets fails', async () => {
        const mockExchangeAPI = {
            loadMarkets: jest.fn().mockRejectedValue(new Error('API error')),
        };
        ccxt['binance'].mockImplementation(() => mockExchangeAPI);

        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        await context.ccxtSeeder.loadMarkets(exchange, ['BTC/EUR']);

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining('Error loading markets for [Binance]'),
        );
    });

    test('createMarket method logs a warning if symbol is not found', async () => {
        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        const currentExchangeMarkets = {};

        await context.ccxtSeeder.createMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.warning).toHaveBeenCalledWith(
            expect.stringContaining('Symbol BTC/EUR not found for [Binance]'),
        );
    });

    test('createMarket method logs an error if Market.findOrCreate fails', async () => {
        context.MarketFindOrCreateMock.mockRejectedValue(
            new Error('Creation failed'),
        );

        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        const currentExchangeMarkets = {
            'BTC/EUR': {
                id: 'btc-eur',
                base: 'BTC',
                quote: 'EUR',
                active: true,
            },
        };

        await context.ccxtSeeder.createMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining(
                'Error creating market [BTC/EUR] for exchange [Binance]',
            ),
        );
    });
});
