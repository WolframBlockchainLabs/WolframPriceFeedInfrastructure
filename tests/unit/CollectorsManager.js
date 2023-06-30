// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cron from 'node-cron';
import { faker } from '@faker-js/faker';
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

    t.context.cronStub = sandbox
        .stub(cron, 'schedule')
        .callsFake((interval, cb) => cb());
    t.context.setTimeoutStub = sandbox.stub(global, 'setTimeout');

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };
    t.context.amqpClientStub = {
        getChannel: sandbox.stub().returns({
            addSetup: sandbox.stub(),
        }),
    };

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
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        exchange,
        symbol,
        exchangeAPI: {},
        rabbitMqConfig: {
            urls: [],
        },
        interval: '* * * * *',
        desync: 30000,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call cron scheduler.', async (t) => {
    const { collectorsManager, cronStub } = t.context;

    await collectorsManager.start();

    t.is(undefined, sinon.assert.calledOnce(cronStub));
});

test('the "start" method should call the "start" method on each model.', async (t) => {
    const {
        collectorsManager,
        candleStickSaveStub,
        orderBookSaveStub,
        tickerSaveStub,
        tradeSaveStub,
    } = t.context;

    collectorsManager.schedule = {
        prev: sandbox.stub().returns({
            toDate: sandbox.stub().returns(new Date()),
        }),
        next: sandbox.stub().returns({
            toDate: sandbox.stub().returns(new Date()),
        }),
    };

    await collectorsManager.initCollectors();
    await collectorsManager.runCollectors();

    t.is(undefined, sinon.assert.calledOnce(candleStickSaveStub));
    t.is(undefined, sinon.assert.calledOnce(orderBookSaveStub));
    t.is(undefined, sinon.assert.calledOnce(tickerSaveStub));
    t.is(undefined, sinon.assert.calledOnce(tradeSaveStub));
});

test('calls logger on error', async (t) => {
    const { collectorsManager, loggerStub, candleStickSaveStub } = t.context;

    candleStickSaveStub.throws();
    collectorsManager.schedule = {
        prev: sandbox.stub().returns({
            toDate: sandbox.stub().returns(new Date()),
        }),
        next: sandbox.stub().returns({
            toDate: sandbox.stub().returns(new Date()),
        }),
    };

    await collectorsManager.initCollectors();
    await collectorsManager.runCollectors();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});

test('loadMarketContext throws an error if market was not found', async (t) => {
    const { collectorsManager, MarketStub } = t.context;

    MarketStub.findOne.resolves(null);

    await t.throwsAsync(collectorsManager.loadMarketContext());
});
