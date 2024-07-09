import CCXTDriverWrapper from '#domain-collectors/integrations/ccxt/driver/CCXTDriverWrapper.js';
import Exchange from '#domain-model/entities/Exchange.js';
import CCXTSeeder from '#workers/seeders/ccxt/CCXTSeeder.js';

jest.mock(
    '#domain-collectors/integrations/ccxt/driver/CCXTDriverWrapper.js',
    () => {
        return jest.fn().mockImplementation(() => ({
            loadMarkets: jest.fn().mockResolvedValue({ 'BTC/EUR': {} }),
        }));
    },
);

describe('[ccxt-seeder]: CCXTSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.ExchangeUpdateOrCreateMock = jest
            .spyOn(Exchange, 'updateOrCreate')
            .mockResolvedValue([
                { id: 1, name: 'Binance', externalExchangeId: 'binance' },
                true,
            ]);

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

    test('execute method calls setupExchange and loadMarkets for each exchange config', async () => {
        const setupExchangeSpy = jest
            .spyOn(context.ccxtSeeder, 'setupExchange')
            .mockResolvedValue({
                id: 1,
                name: 'Binance',
                externalExchangeId: 'binance',
            });
        const loadMarketsSpy = jest
            .spyOn(context.ccxtSeeder, 'loadMarkets')
            .mockResolvedValue();

        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(setupExchangeSpy).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.info).toHaveBeenCalled();
    });

    test('setupExchange method updates or creates an exchange', async () => {
        const exchangeConfig = { id: 'binance', name: 'Binance' };
        const exchange = await context.ccxtSeeder.setupExchange(exchangeConfig);

        expect(exchange).toBeDefined();
        expect(context.ExchangeUpdateOrCreateMock).toHaveBeenCalledWith(
            { externalExchangeId: 'binance' },
            { name: 'Binance', dataSource: 'binance' },
        );
    });

    test('setupExchange logs creation or update of an exchange', async () => {
        const exchangeConfig = { id: 'binance', name: 'Binance' };

        context.ExchangeUpdateOrCreateMock.mockResolvedValue([
            { id: 1, name: 'Binance', externalExchangeId: 'binance' },
            true,
        ]);

        await context.ccxtSeeder.setupExchange(exchangeConfig);

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            'Binance exchange has been created successfully',
        );

        context.ExchangeUpdateOrCreateMock.mockResolvedValue([
            { id: 1, name: 'Binance', externalExchangeId: 'binance' },
            false,
        ]);

        await context.ccxtSeeder.setupExchange(exchangeConfig);

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            'Binance exchange has been updated successfully',
        );
    });

    test('loadMarkets method processes each symbol and tries to create a market', async () => {
        const resetMarketStatusesSpy = jest
            .spyOn(context.ccxtSeeder, 'resetMarketStatuses')
            .mockResolvedValue();
        const setupMarketSpy = jest
            .spyOn(context.ccxtSeeder, 'setupMarket')
            .mockResolvedValue();

        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        await context.ccxtSeeder.loadMarkets(exchange, ['BTC/EUR']);

        expect(resetMarketStatusesSpy).toHaveBeenCalledTimes(1);
        expect(setupMarketSpy).toHaveBeenCalledTimes(1);
    });

    test('setupMarket method creates or updates a market', async () => {
        const updateOrCreateMarketSpy = jest
            .spyOn(context.ccxtSeeder, 'updateOrCreateMarket')
            .mockResolvedValue(true);

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

        await context.ccxtSeeder.setupMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(updateOrCreateMarketSpy).toHaveBeenCalledWith({
            symbol: 'BTC/EUR',
            exchangeId: exchange.id,
            externalMarketId: 'btc-eur',
            base: 'BTC',
            quote: 'EUR',
            baseId: undefined,
            quoteId: undefined,
        });
    });

    test('setupMarket logs creation or update of a market', async () => {
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

        const updateOrCreateMarketSpy = jest
            .spyOn(context.ccxtSeeder, 'updateOrCreateMarket')
            .mockResolvedValue(true);

        await context.ccxtSeeder.setupMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            'Market for [Binance & BTC/EUR] has been created successfully',
        );

        updateOrCreateMarketSpy.mockResolvedValue(false);

        await context.ccxtSeeder.setupMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            'Market for [Binance & BTC/EUR] has been updated successfully',
        );
    });

    test('execute method logs an error if setupExchange fails', async () => {
        const setupExchangeSpy = jest
            .spyOn(context.ccxtSeeder, 'setupExchange')
            .mockRejectedValue(new Error('Creation failed'));

        await context.ccxtSeeder.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Error setting up [Binance] exchange',
                error: expect.any(Error),
            }),
        );
        expect(setupExchangeSpy).toHaveBeenCalled();
    });

    test('loadMarkets method iterates through symbols', async () => {
        const setupMarketSpy = jest
            .spyOn(context.ccxtSeeder, 'setupMarket')
            .mockResolvedValue({});
        const resetMarketStatusesSpy = jest
            .spyOn(context.ccxtSeeder, 'resetMarketStatuses')
            .mockResolvedValue({});
        const mockExchangeAPI = {
            loadMarkets: jest.fn().mockReturnValue({}),
        };
        CCXTDriverWrapper.mockImplementation(() => mockExchangeAPI);

        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        await context.ccxtSeeder.loadMarkets(exchange, ['BTC/EUR']);

        expect(setupMarketSpy).toHaveBeenCalled();
        expect(resetMarketStatusesSpy).toHaveBeenCalled();
    });

    test('setupMarket method logs a warning if symbol is not found', async () => {
        const exchange = {
            id: 1,
            name: 'Binance',
            externalExchangeId: 'binance',
        };
        const currentExchangeMarkets = {};

        await context.ccxtSeeder.setupMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.warning).toHaveBeenCalledWith(
            expect.stringContaining('Symbol BTC/EUR not found for [Binance]'),
        );
    });

    test('setupMarket method logs an error if updateOrCreateMarket fails', async () => {
        const updateOrCreateMarketSpy = jest
            .spyOn(context.ccxtSeeder, 'updateOrCreateMarket')
            .mockRejectedValue(new Error('Creation failed'));

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

        await context.ccxtSeeder.setupMarket(
            exchange,
            currentExchangeMarkets,
            'BTC/EUR',
        );

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'Error creating market [BTC/EUR] for exchange [Binance]',
                error: expect.any(Error),
            }),
        );
        expect(updateOrCreateMarketSpy).toHaveBeenCalled();
    });

    test('resetMarketStatuses method throws a not implemented error', async () => {
        await expect(context.ccxtSeeder.resetMarketStatuses()).rejects.toThrow(
            `[CCXTSeeder]: resetMarketStatuses method is not implemented`,
        );
    });

    test('updateOrCreateMarket method throws a not implemented error', async () => {
        await expect(context.ccxtSeeder.updateOrCreateMarket()).rejects.toThrow(
            `[CCXTSeeder]: updateOrCreateMarket method is not implemented`,
        );
    });
});
