// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import ethDrivers from '../../../../../../lib/collectors/integrations/eth/driver/index.js';
import { ethers } from 'ethers';

let sandbox;

const pair = {
    pool: '0xf07f378bdff2c303f52ee3e83118474e9a15d95e',
    in: {
        address: '0x4f39687328a14dba531fcbd2305724740bb36941',
        symbol: 'WETH',
        name: 'Wrapped Ether',
    },
    out: {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        symbol: 'USDC',
        name: 'USD//C',
    },
};

const tokenData = {
    decimals: {
        inTokenDecimals: 6,
        outTokenDecimals: 6,
    },
    reserves: {
        reserve0: 10,
        reserve1: 1,
    },
    preciseReserves: {
        inReserve: '0.00001',
        outReserve: '0.000001',
    },
};

const pairQuote = '10';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.contractStub = {
        decimals: () => tokenData.decimals.inTokenDecimals,
    };

    sandbox.stub(ethers.providers, 'JsonRpcProvider').get(function () {
        return function () {
            return {};
        };
    });

    sandbox.stub(ethers, 'Contract').get(function () {
        return function () {
            return t.context.contractStub;
        };
    });

    t.context.ethPoolDriver = new ethDrivers['uniswap_v2']('test');
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should format pair and get quote.', async (t) => {
    const { ethPoolDriver } = t.context;

    sandbox
        .stub(ethPoolDriver, 'getReserves')
        .returns(tokenData.preciseReserves);

    const result = await ethPoolDriver.getExchangeRate(pair);

    t.is(result, pairQuote);
});

test('the "getReserves" method should return quantities of tokens in a pool.', async (t) => {
    const { ethPoolDriver } = t.context;
    const { reserves, decimals } = tokenData;

    const pairContract = {
        getReserves: () => reserves,
        token0: () => pair.in.address,
    };

    const result = await ethPoolDriver.getReserves({
        pair,
        pairContract,
        tokensDecimals: decimals,
    });

    t.deepEqual(result, tokenData.preciseReserves);
});

test('the "getReserves" method should return quantities of tokens in a pool with a correct match of tokens and pools.', async (t) => {
    const { ethPoolDriver } = t.context;
    const { reserves, decimals } = tokenData;

    const pairContract = {
        getReserves: () => reserves,
        token0: () => pair.out.address,
    };

    const result = await ethPoolDriver.getReserves({
        pair,
        pairContract,
        tokensDecimals: decimals,
    });

    t.deepEqual(result, {
        inReserve: tokenData.preciseReserves.outReserve,
        outReserve: tokenData.preciseReserves.inReserve,
    });
});
