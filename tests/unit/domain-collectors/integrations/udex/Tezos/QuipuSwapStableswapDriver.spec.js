import tezosDrivers from '#domain-collectors/integrations/udex/Tezos/index.js';

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

        jest.spyOn(
            context.quipuswapStableswapDriver,
            'getContractStorage',
        ).mockResolvedValue(storageStub);

        const result = await context.quipuswapStableswapDriver.getReserves(
            pair,
        );

        expect({
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        }).toEqual({
            poolASize: lpData.token_a_pool.toString(),
            poolBSize: lpData.token_b_pool.toString(),
        });
    });
});
