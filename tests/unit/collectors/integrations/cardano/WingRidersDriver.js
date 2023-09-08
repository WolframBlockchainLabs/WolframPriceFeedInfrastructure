// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cardanoDrivers from '../../../../../lib/collectors/integrations/cardano/index.js';
import BigNumber from 'bignumber.js';

let sandbox;

const pair = {
    pool: 'addr1z8nvjzjeydcn4atcd93aac8allvrpjn7pjr2qsweukpnaytvcg6zm2vds6mz9x3h3yalqmnf24w86m09n40q3tgqxjms9yu6v8',
    in: {
        address:
            'c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d507357696e67526964657273',
        decimals: 0,
    },
    out: {
        address: 'lovelace',
        decimals: 0,
    },
};

const lpData = {
    assets: {
        amount: [
            {
                unit: 'c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d507357696e67526964657273',
                quantity: '1',
            },
            { unit: 'lovelace', quantity: '10' },
        ],
    },

    reserveA: '1',
    reserveB: '10',
};

const pairQuote = '10';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.wingRidersDriver = new cardanoDrivers['wing_riders']({
        projectId: 'test',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should get storage and pair price.', async (t) => {
    const { wingRidersDriver } = t.context;

    const getReservesStub = sinon
        .stub(wingRidersDriver, 'getReserves')
        .returns({
            poolASize: new BigNumber(lpData.reserveA),
            poolBSize: new BigNumber(lpData.reserveB),
        });

    const result = await wingRidersDriver.getExchangeRate(pair);

    sinon.assert.calledOnce(getReservesStub);
    t.deepEqual(result, {
        exchangeRate: pairQuote,
        poolASize: lpData.reserveA,
        poolBSize: lpData.reserveB,
    });
});

test('the "getReserves" method should return pool sizes.', async (t) => {
    const { wingRidersDriver } = t.context;

    const addressesStub = sinon
        .stub(wingRidersDriver.blockFrost, 'addresses')
        .returns(lpData.assets);

    const result = await wingRidersDriver.getReserves(pair);

    sinon.assert.calledOnce(addressesStub);
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
