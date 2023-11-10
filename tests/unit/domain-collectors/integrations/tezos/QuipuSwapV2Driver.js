// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import tezosDrivers from '../../../../../lib/domain-collectors/integrations/tezos/index.js';

let sandbox;

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

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.execViewStub = sandbox.stub().returns([{ reserves: lpData }]);

    t.context.quipuswapV2Driver = new tezosDrivers['quipuswap_v2']('test');

    t.context.quipuswapV2Driver.tezosClient = {
        contract: {
            at() {
                return {
                    contractViews: {
                        get_reserves() {
                            return { executeView: t.context.execViewStub };
                        },
                    },
                };
            },
        },
    };
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should format pair and get quote.', async (t) => {
    const { quipuswapV2Driver, execViewStub } = t.context;

    const result = await quipuswapV2Driver.getExchangeRate(pair);

    sinon.assert.calledOnce(execViewStub);
    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: lpData.token_a_pool,
        poolBSize: lpData.token_b_pool,
    });
});

test('the "getReserves" method should take into account decimals if provided.', async (t) => {
    const { quipuswapV2Driver, execViewStub } = t.context;

    const result = await quipuswapV2Driver.getExchangeRate({
        ...pair,
        in: { decimals: 1 },
        out: { decimals: 1 },
    });

    sinon.assert.calledOnce(execViewStub);
    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: (lpData.token_a_pool / 10).toString(),
        poolBSize: (lpData.token_b_pool / 10).toString(),
    });
});
