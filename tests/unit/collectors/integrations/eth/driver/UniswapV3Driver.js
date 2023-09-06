// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import ethDrivers from '../../../../../../lib/collectors/integrations/eth/driver/index.js';
import { ethers } from 'ethers';

let sandbox;

const pair = {
    in: {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
    },
    out: {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD//C',
    },
};

const pairQuote = '111';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.quoterContractStub = {
        callStatic: {
            quoteExactInputSingle: sandbox.stub(),
        },
    };

    sandbox.stub(ethers.providers, 'JsonRpcProvider').get(function () {
        return function () {
            return {};
        };
    });

    sandbox.stub(ethers, 'Contract').get(function () {
        return function () {
            return t.context.quoterContractStub;
        };
    });

    t.context.uniswapV3Driver = new ethDrivers['uniswap_v3']('test');
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should format pair and get quote.', async (t) => {
    const { uniswapV3Driver, quoterContractStub } = t.context;

    quoterContractStub.callStatic.quoteExactInputSingle.returns(
        `${pairQuote}${'0'.repeat(pair.out.decimals)}`,
    );

    const result = await uniswapV3Driver.getExchangeRate(pair);

    t.is(
        undefined,
        sinon.assert.calledOnce(
            quoterContractStub.callStatic.quoteExactInputSingle,
        ),
    );
    t.deepEqual(result, {
        exchangeRate: pairQuote,
    });
});
