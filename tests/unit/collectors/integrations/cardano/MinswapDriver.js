// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cardanoDrivers from '../../../../../lib/collectors/integrations/cardano/index.js';
import BigNumber from 'bignumber.js';

let sandbox;

const pair = {
    pool: '6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2',
    in: {
        address: 'lovelace',
        decimals: 0,
    },
    out: {
        address:
            '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
        decimals: 0,
    },
};

const lpData = {
    reserveA: '1',
    reserveB: '10',
    assetA: 'lovelace',
};

const pairQuote = '10';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.minswapDriver = new cardanoDrivers['minswap']({
        projectId: 'test',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should get storage and pair price.', async (t) => {
    const { minswapDriver } = t.context;

    const getReservesStub = sinon.stub(minswapDriver, 'getReserves').returns({
        poolASize: new BigNumber(lpData.reserveA),
        poolBSize: new BigNumber(lpData.reserveB),
    });

    const result = await minswapDriver.getExchangeRate(pair);

    sinon.assert.calledOnce(getReservesStub);
    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: lpData.reserveA,
        poolBSize: lpData.reserveB,
    });
});

test('the "getReserves" method should return pool sizes.', async (t) => {
    const { minswapDriver } = t.context;

    const getPoolByIdStub = sinon
        .stub(minswapDriver.minswapAdapter, 'getPoolById')
        .returns(lpData);

    const result = await minswapDriver.getReserves(pair);

    sinon.assert.calledOnce(getPoolByIdStub);
    t.deepEqual(
        {
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        },
        {
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        },
    );
});

test('the "getReserves" method should return pool sizes flipped for flipped addresses.', async (t) => {
    const { minswapDriver } = t.context;

    const getPoolByIdStub = sinon
        .stub(minswapDriver.minswapAdapter, 'getPoolById')
        .returns({ ...lpData, assetA: pair.out.address });

    const result = await minswapDriver.getReserves(pair);

    sinon.assert.calledOnce(getPoolByIdStub);
    t.deepEqual(
        {
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        },
        {
            poolBSize: lpData.reserveA,
            poolASize: lpData.reserveB,
        },
    );
});
