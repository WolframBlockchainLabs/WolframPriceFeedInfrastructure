// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cron from 'node-cron';
import { faker } from '@faker-js/faker';
import Exchange from '../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../lib/domain-model/entities/Market.js';
import CollectorsManager from '../../../lib/domain-collectors/CollectorsManager.js';
import CandleStickCollector from '../../../lib/domain-collectors/collectors/CandleStickCollector.js';
import OrderBookCollector from '../../../lib/domain-collectors/collectors/OrderBookCollector.js';
import TickerCollector from '../../../lib/domain-collectors/collectors/TickerCollector.js';
import TradeCollector from '../../../lib/domain-collectors/collectors/TradeCollector.js';

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
        rateLimit: 50,
        rateLimitMargin: 10,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
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

test('the "runCollectors" method should call the "setTimeout" method for each model.', async (t) => {
    const { collectorsManager, setTimeoutStub } = t.context;

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

    t.is(setTimeoutStub.callCount, collectorsManager.collectors.length);
});

test('calls logger on error', async (t) => {
    const {
        collectorsManager,
        loggerStub,
        candleStickSaveStub,
        setTimeoutStub,
    } = t.context;

    candleStickSaveStub.throws();
    const setTimeoutCallbackPromise = new Promise((resolve) => {
        setTimeoutStub.callsFake(async (cb) => {
            await cb();

            resolve();
        });
    });

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
    await setTimeoutCallbackPromise;

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});

test('loadMarketContext throws an error if market was not found', async (t) => {
    const { collectorsManager, MarketStub } = t.context;

    MarketStub.findOne.resolves(null);

    await t.throwsAsync(collectorsManager.loadMarketContext());
});
