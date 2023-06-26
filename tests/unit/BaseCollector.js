// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import Collector from '../../lib/collectors/BaseCollector.js';
import testLogger from '../testLogger.js';

let sandbox;

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

    t.context.collector = new Collector({
        logger: testLogger,
        exchange,
        symbol,
        marketId,
        exchangeAPI: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('start method should call fetch and save data', async (t) => {
    const { collector } = t.context;

    sandbox.stub(collector, 'fetchData').resolves(fetchOrderBookStubResult);

    sandbox.stub(collector, 'saveData').resolves();

    await collector.start();

    t.is(undefined, sinon.assert.calledOnce(collector.fetchData));
    t.is(undefined, sinon.assert.calledOnce(collector.saveData));
});
