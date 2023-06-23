/* eslint-disable no-shadow */
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import startCollectors from '../../lib/cli/ccxt_collectors/start_collectors.js';
import { OrderBookCollector } from '../../lib/collectors/ccxt/OrderBook.js';
import { CandleStickCollector } from '../../lib/collectors/ccxt/CandleStick.js';
import { TickerCollector } from '../../lib/collectors/ccxt/Ticker.js';
import { TradeCollector } from '../../lib/collectors/ccxt/Trade.js';

let sandbox;

let getMarketInfoStub;

let orderBookCollectorStub;

let candleStickCollectorStub;

let tickerCollectorStub;

let tradeCollectorStub;

const exchange = 'binance';
const symbol = faker.word.noun();
const sequelize = { sequelize: faker.word.noun() };
const getMarketInfoStubResult = { marketId: faker.number.int() };

test.beforeEach(() => {
    sandbox = sinon.createSandbox();

    getMarketInfoStub = sandbox.stub().resolves(getMarketInfoStubResult);

    orderBookCollectorStub = sandbox.stub(
        OrderBookCollector.prototype,
        'start',
    );
    candleStickCollectorStub = sandbox.stub(
        CandleStickCollector.prototype,
        'start',
    );
    tickerCollectorStub = sandbox.stub(TickerCollector.prototype, 'start');
    tradeCollectorStub = sandbox.stub(TradeCollector.prototype, 'start');
});

test.afterEach(() => {
    sandbox.restore();
});

test('Positive: start collector function', async (t) => {
    await startCollectors({
        exchange,
        symbol,
        marketService: { getMarketInfo: getMarketInfoStub },
        sequelize,
    });

    t.is(
        undefined,
        sinon.assert.calledOnceWithExactly(getMarketInfoStub, exchange, symbol),
    );
    t.is(undefined, sinon.assert.calledOnce(orderBookCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(candleStickCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(tickerCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(tradeCollectorStub));
});
