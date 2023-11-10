// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import tezosDrivers from '../../../../../lib/domain-collectors/integrations/tezos/index.js';

let sandbox;

const pair = {
    pool: 'KT1X1nkqJDR1UHwbfpcnME5Z7agJLjUQNguB',
    in: {
        address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
        decimals: 0,
        symbol: 'ctez',
        name: 'Ctez',
    },
    out: {
        address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        decimals: 0,
        symbol: 'kUSD',
        name: 'Kolibri USD',
    },
};

const lpData = {
    token1_pool: '1',
    token2_pool: '10',
    token1Address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
};

const pairQuote = '10';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.plentyDriver = new tezosDrivers['plenty']('test');
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should get storage and pair price.', async (t) => {
    const { plentyDriver } = t.context;

    const getContractStorageStub = sinon.stub(
        plentyDriver,
        'getContractStorage',
    );
    const getPairPriceStub = sinon.stub(plentyDriver, 'getPairPrice');
    const getTokenPoolsStub = sinon.stub(plentyDriver, 'getTokenPools');

    await plentyDriver.getExchangeRate(pair);

    sinon.assert.calledOnce(getContractStorageStub);
    sinon.assert.calledOnce(getPairPriceStub);
    sinon.assert.calledOnce(getTokenPoolsStub);

    t.pass();
});

test('the "getPairPrice" method should return pool sizes and exchange rate.', async (t) => {
    const { plentyDriver } = t.context;

    const result = await plentyDriver.getPairPrice(pair, lpData);

    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: lpData.token1_pool.toString(),
        poolBSize: lpData.token2_pool.toString(),
    });
});

test('the "getTokenPools" method should return pool sizes.', async (t) => {
    const { plentyDriver } = t.context;

    const result = await plentyDriver.getTokenPools(lpData, pair);

    t.deepEqual(result, {
        token1_pool: lpData.token1_pool.toString(),
        token2_pool: lpData.token2_pool.toString(),
    });
});

test('the "getTokenPools" method should return pool sizes flipped for flipped addresses.', async (t) => {
    const { plentyDriver } = t.context;

    const result = await plentyDriver.getTokenPools(
        { ...lpData, token1Address: pair.out.address },
        pair,
    );

    t.deepEqual(result, {
        token2_pool: lpData.token1_pool.toString(),
        token1_pool: lpData.token2_pool.toString(),
    });
});
