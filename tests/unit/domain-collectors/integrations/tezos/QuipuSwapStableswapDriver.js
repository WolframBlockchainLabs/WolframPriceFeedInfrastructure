// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import tezosDrivers from '../../../../../lib/domain-collectors/integrations/tezos/index.js';

let sandbox;

const pair = {
    id: 2,
};

const lpData = {
    token_a_pool: '1',
    token_b_pool: '10',
};

const pairQuote = '10';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.quipuswapStableswapDriver = new tezosDrivers[
        'quipuswap_stableswap'
    ]('test');
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should get storage and pair price.', async (t) => {
    const { quipuswapStableswapDriver } = t.context;

    const getContractStorageStub = sinon.stub(
        quipuswapStableswapDriver,
        'getContractStorage',
    );
    const getPairPriceStub = sinon.stub(
        quipuswapStableswapDriver,
        'getPairPrice',
    );

    await quipuswapStableswapDriver.getExchangeRate(pair);

    sinon.assert.calledOnce(getContractStorageStub);
    sinon.assert.calledOnce(getPairPriceStub);

    t.pass();
});

test('the "getPairPrice" method should return pool sizes and exchange rate.', async (t) => {
    const { quipuswapStableswapDriver } = t.context;

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

    const result = await quipuswapStableswapDriver.getPairPrice(storageStub);

    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: lpData.token_a_pool.toString(),
        poolBSize: lpData.token_b_pool.toString(),
    });
});
