import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import testLogger from '../testLogger.js';
import Exchange from '../../lib/domain-model/entities/Exchange.js';
import Market from '../../lib/domain-model/entities/Market.js';
import CollectorsManager from '../../lib/collectors/CollectorsManager.js';
import CandleStickCollector from '../../lib/collectors/models/CandleStick.js';
import OrderBookCollector from '../../lib/collectors/models/OrderBook.js';
import TickerCollector from '../../lib/collectors/models/Ticker.js';
import TradeCollector from '../../lib/collectors/models/Trade.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const exchangeId = faker.number.int();
const marketId = faker.number.int();

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.candleStickSaveStub = sandbox.stub(
        CandleStickCollector.prototype,
        'start',
    );

    t.context.orderBookSaveStub = sandbox.stub(
        OrderBookCollector.prototype,
        'start',
    );

    t.context.tickerSaveStub = sandbox.stub(TickerCollector.prototype, 'start');

    t.context.tradeSaveStub = sandbox.stub(TradeCollector.prototype, 'start');

    t.context.ExchangeStub = {
        findOne: sandbox.stub(Exchange, 'findOne').returns({ id: exchangeId }),
    };

    t.context.MarketStub = {
        findOne: sandbox.stub(Market, 'findOne').returns({ id: marketId }),
    };

    t.context.collectorsManager = new CollectorsManager({
        models: [
            CandleStickCollector,
            OrderBookCollector,
            TickerCollector,
            TradeCollector,
        ],
        logger: testLogger,
        exchange,
        symbol,
        exchangeAPI: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('The "start" method should call the "init" method and a "start" method on each model.', async (t) => {
    await t.context.collectorsManager.start();

    t.is(undefined, sinon.assert.calledOnce(t.context.candleStickSaveStub));
    t.is(undefined, sinon.assert.calledOnce(t.context.orderBookSaveStub));
    t.is(undefined, sinon.assert.calledOnce(t.context.tickerSaveStub));
    t.is(undefined, sinon.assert.calledOnce(t.context.tradeSaveStub));
});
