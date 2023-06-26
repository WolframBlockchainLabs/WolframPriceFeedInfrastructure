import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import OrderBookCollector from '../../../lib/collectors/models/OrderBook.js';
import testLogger from '../../testLogger.js';
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

    t.context.exchangeAPIStub = {
        loadMarkets: sandbox.stub().resolves({
            [symbol]: {
                id: 'externalMarketId',
                base: 'base',
                quote: 'quote',
                baseId: 'baseId',
                quoteId: 'quoteId',
                active: true,
            },
        }),
        fetchOrderBook: sandbox.stub().resolves(fetchOrderBookStubResult),
    };

    t.context.OrderBookStub = {
        create: sandbox.stub(OrderBook, 'create'),
    };

    t.context.orderBookCollector = new OrderBookCollector({
        logger: testLogger,
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
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchOrderBook));
});

test('save data should call model.create', async (t) => {
    const { orderBookCollector } = t.context;
    const { bids, asks } = fetchOrderBookStubResult;

    t.context.OrderBookStub.create.resolves(orderBookId);

    await orderBookCollector.saveData({ bids, asks }, marketId);

    t.is(undefined, sinon.assert.calledOnce(t.context.OrderBookStub.create));
});
