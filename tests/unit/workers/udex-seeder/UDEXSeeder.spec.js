import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';
import UDEXSeeder from '../../../../lib/workers/udex-seeder/UDEXSeeder.js';

const ethConfig = {
    exchanges: [
        {
            id: 'uniswap_v3',
            name: 'Uniswap_v3',
            markets: [
                {
                    pair: {
                        in: {
                            address:
                                '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                            decimals: 18,
                            symbol: 'WETH',
                            name: 'Wrapped Ether',
                        },
                        out: {
                            address:
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                            decimals: 6,
                            symbol: 'USDC',
                            name: 'USD//C',
                        },
                    },
                    symbol: 'WETH/USDC',
                },
            ],
        },
    ],
};

describe('[udex-seeder]: UDEXSeeder Tests Suite', () => {
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

        context.udexSeeder = new UDEXSeeder({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was created', async () => {
        const loadMarketsSpy = jest
            .spyOn(context.udexSeeder, 'loadMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.udexSeeder.execute(ethConfig);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the execute method passes symbols to the loadMarkets method if exchange was found', async () => {
        context.ExchangeStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);
        const loadMarketsSpy = jest
            .spyOn(context.udexSeeder, 'loadMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.udexSeeder.execute(ethConfig);

        expect(context.ExchangeStub.findOrCreate).toHaveBeenCalledTimes(1);
        expect(loadMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method tries to create a markets if they are not found', async () => {
        await context.udexSeeder.loadMarkets(
            {
                externalExchangeId: 'uniswap_v3',
                name: 'Uniswap_v3',
            },
            ethConfig.exchanges[0].markets,
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the loadMarkets method will not create market if it was found', async () => {
        context.MarketStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);
        await context.udexSeeder.loadMarkets(
            {
                externalExchangeId: 'uniswap_v3',
                name: 'Uniswap_v3',
            },
            ethConfig.exchanges[0].markets,
        );

        expect(context.MarketStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
