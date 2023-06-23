/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import Collector from '../../lib/collectors/Base.js';

let sandbox;

let sequelize;

let ccxtStub;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const fetchOrderBookStubResult = {
    symbol,
    bids: [[faker.number.float()]],
    asks: [[faker.number.float()]],
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    sequelize = {};

    ccxtStub = sandbox.stub(ccxt, 'binance').returns({});

    t.context.collector = new Collector(
        { exchange, symbol },
        sequelize,
        marketId,
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('start method should call fetch and save data', async (t) => {
    const { collector } = t.context;

    const exchangeApiStub = new ccxt[exchange]();

    sandbox.stub(collector, 'fetchData').resolves(fetchOrderBookStubResult);

    sandbox.stub(collector, 'saveData').resolves();

    await collector.start();

    t.is(undefined, sinon.assert.calledOnce(collector.fetchData));
    t.is(undefined, sinon.assert.calledOnce(collector.saveData));
});
