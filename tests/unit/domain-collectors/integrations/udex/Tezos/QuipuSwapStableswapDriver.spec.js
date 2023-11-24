import tezosDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Tezos/index.js';

describe('[domain-collectors/integrations/tezos]: QuipuswapStableswapDriver Tests Suite', () => {
    const context = {};

    const pair = {
        meta: {
            id: 2,
        },
    };

    const lpData = {
        token_a_pool: '1',
        token_b_pool: '10',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.quipuswapStableswapDriver = new tezosDrivers.drivers[
            'quipuswap_stableswap'
        ]({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(
            context.quipuswapStableswapDriver,
            'getContractStorage',
        ).mockResolvedValue();
        jest.spyOn(
            context.quipuswapStableswapDriver,
            'getPairPrice',
        ).mockResolvedValue();

        await context.quipuswapStableswapDriver.getExchangeRate(pair);

        expect(
            context.quipuswapStableswapDriver.getContractStorage,
        ).toHaveBeenCalledTimes(1);
        expect(
            context.quipuswapStableswapDriver.getPairPrice,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "getPairPrice" method should return pool sizes and exchange rate', async () => {
        const storageStub = {
            storage: {
                pools: {
                    get() {
                        return {
                            tokens_info: {
                                get(param) {
                                    return param === '0'
                                        ? {
                                              reserves: lpData.token_a_pool,
                                              precision_multiplier_f: 1,
                                          }
                                        : {
                                              reserves: lpData.token_b_pool,
                                              precision_multiplier_f: 1,
                                          };
                                },
                            },
                        };
                    },
                },
            },
        };

        const result = await context.quipuswapStableswapDriver.getPairPrice(
            storageStub,
        );

        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.token_a_pool.toString(),
            poolBSize: lpData.token_b_pool.toString(),
        });
    });
});
