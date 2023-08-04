// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cron from 'node-cron';
import { faker } from '@faker-js/faker';
import Exchange from '../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../lib/domain-model/entities/Market.js';
import CandleStickCollector from '../../../lib/collectors/models/CandleStick.js';
import OrderBookCollector from '../../../lib/collectors/models/OrderBook.js';
import TickerCollector from '../../../lib/collectors/models/Ticker.js';
import TradeCollector from '../../../lib/collectors/models/Trade.js';
import HistoricalManager from '../../../lib/collectors/HistoricalManager.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const exchangeId = faker.number.int();
const marketId = faker.number.int();

const cycleCeil = 1;
const cycleCounter = 0;
const lastLimit = 5;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.cronTaskStub = { stop: sandbox.stub() };
    t.context.cronStub = sandbox
        .stub(cron, 'schedule')
        .callsFake((interval, cb) => {
            cb();
            return t.context.cronTaskStub;
        });
    t.context.setTimeoutStub = sandbox
        .stub(global, 'setTimeout')
        .callsFake((cb) => cb());

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

    t.context.historicalManager = new HistoricalManager({
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
        rateLimit: 50,
        rateLimitMargin: 10,
        queuePosition: 3,
        queueSize: 5,
        scheduleStartDate: '2023-08-04 07:40:00+0000',
        scheduleEndDate: '2023-08-04 07:45:00+0000',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call initCycleCounter.', async (t) => {
    const { historicalManager, cronTaskStub } = t.context;

    const initCycleCounterStub = sandbox.stub(
        historicalManager,
        'initCycleCounter',
    );

    await historicalManager.start();

    t.is(undefined, sinon.assert.calledOnce(initCycleCounterStub));
    t.is(undefined, sinon.assert.calledOnce(cronTaskStub.stop));
});

test('the "initCycleCounter" method should set cycleCeil, cycleCounter, lastLimit.', async (t) => {
    const { historicalManager } = t.context;

    t.is(historicalManager.cycleCeil, null);
    t.is(historicalManager.cycleCounter, null);
    t.is(historicalManager.lastLimit, null);

    historicalManager.initCycleCounter();

    t.is(historicalManager.cycleCeil, cycleCeil);
    t.is(historicalManager.cycleCounter, cycleCounter);
    t.is(historicalManager.lastLimit, lastLimit);

    historicalManager.cycleCeil = null;
    historicalManager.cycleCounter = null;
    historicalManager.lastLimit = null;
});

test('the "setNextInterval" method should set next interval start and end.', async (t) => {
    const { historicalManager } = t.context;

    historicalManager.cycleCeil = 3;
    historicalManager.lastLimit = 5;

    historicalManager.cycleCounter = 0;

    historicalManager.setNextInterval();

    t.is(historicalManager.intervalStart, 1691134800000);
    t.is(historicalManager.intervalEnd, 1691164800000);

    historicalManager.setNextInterval();

    t.is(historicalManager.intervalStart, 1691164800000);
    t.is(historicalManager.intervalEnd, 1691194800000);

    historicalManager.setNextInterval();

    t.is(historicalManager.intervalStart, 1691194800000);
    t.is(historicalManager.intervalEnd, 1691195100000);

    historicalManager.cycleCeil = null;
    historicalManager.lastLimit = null;
    historicalManager.cycleCounter = null;
});
