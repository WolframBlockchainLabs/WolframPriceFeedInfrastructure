import Market from '#domain-model/entities/Market.js';
import CCXTRealtimeSeeder from '#workers/seeders/ccxt/realtime/CCXTRealtimeSeeder.js';

describe('[ccxt-realtime-seeder]: CCXTRealtimeSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.MarketUpdateMock = jest
            .spyOn(Market, 'update')
            .mockResolvedValue([1]);

        context.MarketUpdateOrCreateMock = jest
            .spyOn(Market, 'updateOrCreate')
            .mockResolvedValue([{ id: 1 }, true]);

        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
        };

        context.ccxtRealtimeSeeder = new CCXTRealtimeSeeder({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('resetMarketStatuses method updates market statuses', async () => {
        await context.ccxtRealtimeSeeder.resetMarketStatuses(1);

        expect(context.MarketUpdateMock).toHaveBeenCalledWith(
            { active: false },
            {
                where: {
                    exchangeId: 1,
                },
            },
        );
    });

    test('updateOrCreateMarket method updates or creates a market with active flag', async () => {
        const marketData = {
            symbol: 'BTC/EUR',
            exchangeId: 1,
            externalMarketId: 'btc-eur',
            base: 'BTC',
            quote: 'EUR',
            baseId: 'btc',
            quoteId: 'eur',
            active: true,
        };

        const created =
            await context.ccxtRealtimeSeeder.updateOrCreateMarket(marketData);

        expect(created).toBe(true);
        expect(context.MarketUpdateOrCreateMock).toHaveBeenCalledWith(
            {
                symbol: 'BTC/EUR',
                exchangeId: 1,
            },
            {
                active: true,
                externalMarketId: 'btc-eur',
                base: 'BTC',
                quote: 'EUR',
                baseId: 'btc',
                quoteId: 'eur',
            },
        );
    });
});
