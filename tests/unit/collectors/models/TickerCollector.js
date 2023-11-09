// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import TickerCollector from '../../../../lib/collectors/models/TickerCollector.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const fetchTickerStubResult = {
    high: faker.number.float(),
    low: faker.number.float(),
    bid: faker.number.float(),
    bidVolume: faker.number.float(),
    ask: faker.number.float(),
    askVolume: faker.number.float(),
    vwap: faker.number.float(),
    open: faker.number.float(),
    close: faker.number.float(),
    last: faker.number.float(),
    previousClose: faker.number.float(),
    change: faker.number.float(),
    percentage: faker.number.float(),
    average: faker.number.float(),
    baseVolume: faker.number.float(),
    quoteVolume: faker.number.float(),
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        fetchTicker: sandbox.stub().resolves(fetchTickerStubResult),
    };

    t.context.tickerCollector = new TickerCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    t.context.publishStub = sandbox.stub(t.context.tickerCollector, 'publish');
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing ticker info', async (t) => {
    const { tickerCollector, exchangeAPIStub } = t.context;

    const result = await tickerCollector.fetchData();

    t.deepEqual(result, fetchTickerStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchTicker));
});

test('save data should call publish method', async (t) => {
    const { tickerCollector, publishStub } = t.context;

    await tickerCollector.saveData(fetchTickerStubResult);

    t.is(undefined, sinon.assert.calledOnce(publishStub));
});

test('calls logger if fetch fails', async (t) => {
    const { tickerCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.fetchTicker.throws();

    await tickerCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
