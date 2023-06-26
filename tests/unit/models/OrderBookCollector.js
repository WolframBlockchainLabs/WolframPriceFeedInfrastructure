// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import OrderBookCollector from '../../../lib/collectors/models/OrderBook.js';
import OrderBook from '../../../lib/domain-model/entities/OrderBook.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const orderBookId = faker.number.int();

const fetchOrderBookStubResult = {
    symbol,
    bids: [[faker.number.float()]],
    asks: [[faker.number.float()]],
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        fetchOrderBook: sandbox.stub().resolves(fetchOrderBookStubResult),
    };

    t.context.OrderBookStub = {
        create: sandbox.stub(OrderBook, 'create'),
    };

    t.context.orderBookCollector = new OrderBookCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing orderBook info', async (t) => {
    const { orderBookCollector, exchangeAPIStub } = t.context;

    const result = await orderBookCollector.fetchData();

    t.deepEqual(result, fetchOrderBookStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchOrderBook));
});

test('save data should call model.create', async (t) => {
    const { orderBookCollector, OrderBookStub } = t.context;
    const { bids, asks } = fetchOrderBookStubResult;

    OrderBookStub.create.resolves(orderBookId);

    await orderBookCollector.saveData({ bids, asks }, marketId);

    t.is(undefined, sinon.assert.calledOnce(OrderBookStub.create));
});

test('calls logger if fetch fails', async (t) => {
    const { orderBookCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.fetchOrderBook.throws();

    await orderBookCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});

test('calls logger if save fails', async (t) => {
    const { orderBookCollector, OrderBookStub, loggerStub } = t.context;

    OrderBookStub.create.throws();

    await orderBookCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
