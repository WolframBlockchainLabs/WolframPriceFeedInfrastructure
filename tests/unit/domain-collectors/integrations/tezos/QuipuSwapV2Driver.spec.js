import tezosDrivers from '../../../../../lib/domain-collectors/integrations/tezos/index.js';

describe('[domain-collectors/integrations/tezos]: QuipuswapV2Driver Tests Suite', () => {
    const context = {};

    const pair = {
        id: 2,
        in: {},
        out: {},
    };

    const lpData = {
        token_a_pool: '1',
        token_b_pool: '10',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.execViewStub = jest
            .fn()
            .mockResolvedValue([{ reserves: lpData }]);
        context.quipuswapV2Driver = new tezosDrivers['quipuswap_v2']('test');

        context.quipuswapV2Driver.tezosClient = {
            contract: {
                at: jest.fn().mockResolvedValue({
                    contractViews: {
                        get_reserves: () => ({
                            executeView: context.execViewStub,
                        }),
                    },
                }),
            },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should format pair and get quote', async () => {
        const result = await context.quipuswapV2Driver.getExchangeRate(pair);

        expect(context.execViewStub).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.token_a_pool,
            poolBSize: lpData.token_b_pool,
        });
    });

    test('the "getReserves" method should take into account decimals if provided', async () => {
        const modifiedPair = {
            ...pair,
            in: { decimals: 1 },
            out: { decimals: 1 },
        };

        const result = await context.quipuswapV2Driver.getExchangeRate(
            modifiedPair,
        );

        expect(context.execViewStub).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: (lpData.token_a_pool / 10).toString(),
            poolBSize: (lpData.token_b_pool / 10).toString(),
        });
    });
});
