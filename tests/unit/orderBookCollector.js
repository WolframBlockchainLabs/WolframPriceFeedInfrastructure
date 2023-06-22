/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import { OrderBookCollector } from '../../lib/collectors/OrderBook.js';

let sandbox;

let sequelize;

let ccxtStub;

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

    sequelize = {
        OrderBook: {
            create: sinon.stub(),
        },
    };

    ccxtStub = sandbox.stub(ccxt, 'binance').returns({
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
    });

    t.context.orderBookCollector = new OrderBookCollector(
        { exchange, symbol },
        sequelize,
        marketId,
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing orderBook info', async (t) => {
    const { orderBookCollector } = t.context;
    const exchangeApiStub = new ccxt[exchange]();

    const result = await orderBookCollector.fetchData();

    t.deepEqual(result, fetchOrderBookStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.fetchOrderBook));
});

test('save data should call model.create', async (t) => {
    const { orderBookCollector } = t.context;
    const { bids, asks } = fetchOrderBookStubResult;

    orderBookCollector.sequelize.OrderBook.create.resolves(orderBookId);

    await orderBookCollector.saveData({ bids, asks }, marketId);

    t.is(undefined, sinon.assert.calledOnce(sequelize.OrderBook.create));
});
