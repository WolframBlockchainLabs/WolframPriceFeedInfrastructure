// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import TradeCollector from '../../../lib/collectors/models/Trade.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const fetchTradeStubResult = [
    { side: 'sell', price: 0.066754, amount: 0.055, timestamp: 1684141361369 },
];

const fetchedDataMap = [[1, 0.066754, 0.055, 1684141361369]];

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        fetchTrades: sandbox.stub().resolves(fetchTradeStubResult),
        milliseconds: sandbox.stub().resolves(6000),
    };

    t.context.tradeCollector = new TradeCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    t.context.publishStub = sandbox.stub(t.context.tradeCollector, 'publish');
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing trade info', async (t) => {
    const { tradeCollector, exchangeAPIStub } = t.context;

    const result = await tradeCollector.fetchData();

    t.deepEqual(result, fetchedDataMap);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchTrades));
});

test('save data should call model.create', async (t) => {
    const { tradeCollector, publishStub } = t.context;

    await tradeCollector.saveData(marketId, fetchedDataMap);

    t.is(undefined, sinon.assert.calledOnce(publishStub));
});

test('calls logger if fetch fails', async (t) => {
    const { tradeCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.fetchTrades.throws();

    await tradeCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});

test('calls logger if save fails', async (t) => {
    const { tradeCollector, publishStub, loggerStub } = t.context;

    publishStub.throws();

    await tradeCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
