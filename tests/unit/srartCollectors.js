/* eslint-disable no-shadow */
// eslint-disable-next-line import/no-unresolved
import test                     from 'ava';
import sinon                    from 'sinon';
import { faker }                from '@faker-js/faker';
import startCollectors          from '../../lib/collector/startCollectors.js';
import { OrderBookCollector }   from '../../lib/collector/OrderBook.js';
import { CandleStickCollector } from '../../lib/collector/CandleStick.js';
import { TickerCollector }      from '../../lib/collector/Ticker.js';
import { TradeCollector }       from '../../lib/collector/Trade.js';


let sandbox;

let getMarketInfoStub;

let orderBookCollectorStub;

let candleStickCollectorStub;

let tickerCollectorStub;

let tradeCollectorStub;

const exchange = 'binance';
const symbol =  faker.word.noun();
const sequelize = { sequelize: faker.word.noun() };
const getMarketInfoStubResult = { marketId: faker.number.int() };


test.beforeEach(() => {
    sandbox = sinon.createSandbox();

    getMarketInfoStub = sandbox.stub().resolves(getMarketInfoStubResult);

    orderBookCollectorStub = sandbox.stub(OrderBookCollector.prototype, 'start');
    candleStickCollectorStub = sandbox.stub(
        CandleStickCollector.prototype,
        'start'
    );
    tickerCollectorStub = sandbox.stub(TickerCollector.prototype, 'start');
    tradeCollectorStub = sandbox.stub(TradeCollector.prototype, 'start');
});

test.afterEach(() => {
    sandbox.restore();
});

test('Positive: start collector function', async (t) => {
    await startCollectors({ exchange, symbol,  marketService: { getMarketInfo: getMarketInfoStub }, sequelize });

    t.is(
        undefined,
        sinon.assert.calledOnceWithExactly(getMarketInfoStub, exchange, symbol)
    );
    t.is(undefined, sinon.assert.calledOnce(orderBookCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(candleStickCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(tickerCollectorStub));
    t.is(undefined, sinon.assert.calledOnce(tradeCollectorStub));
});
