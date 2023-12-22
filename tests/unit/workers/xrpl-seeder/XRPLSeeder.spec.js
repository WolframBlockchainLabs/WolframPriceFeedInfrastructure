import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import XRPLSeeder from '#workers/xrpl-seeder/XRPLSeeder.js';

const udexConf = {
    exchange: {
        id: 'xrpl',
        name: 'XRPL',
    },
    markets: [
        {
            pair: {
                base: {
                    currency: 'XRP',
                },
                counter: {
                    currency: 'USD',
                    issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                },
            },
            symbol: 'XRP/Bitstamp-USD',
        },
    ],
};

describe('[xrpl-seeder]: XRPLSeeder Tests Suite', () => {
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

        context.xrplSeeder = new XRPLSeeder({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was created', async () => {
        const loadMarketsSpy = jest.spyOn(context.xrplSeeder, 'loadMarkets');

        await context.xrplSeeder.execute(udexConf);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was found', async () => {
        context.ExchangeStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);
        const loadMarketsSpy = jest.spyOn(context.xrplSeeder, 'loadMarkets');

        await context.xrplSeeder.execute(udexConf);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method tries to create a markets if they are not found', async () => {
        await context.xrplSeeder.loadMarkets(
            udexConf.exchange,
            udexConf.markets,
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method will not create market if it was found', async () => {
        context.MarketStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);
        await context.xrplSeeder.loadMarkets(
            udexConf.exchange,
            udexConf.markets,
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
