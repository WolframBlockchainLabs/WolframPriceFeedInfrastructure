// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import HistoricalManager from '../../../lib/domain-collectors/HistoricalManager.js';
import HistoricalScheduler from '../../../lib/domain-collectors/infrastructure/HistoricalScheduler.js';
import CandleStickCollector from '../../../lib/domain-collectors/collectors/CandleStickCollector.js';

let sandbox;

const schedulerOptions = {
    baseRateLimit: 50,
    rateLimitMargin: 10,
    operationsAmount: 4,
    queuePosition: 3,
    queueSize: 5,
    replicaSize: 2,
    instancePosition: 1,

    scheduleStartDate: '2023-08-04 07:40:00+0000',
    scheduleEndDate: '2023-08-04 07:45:00+0000',
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.amqpClientStub = {
        getChannel: sandbox.stub().returns({
            addSetup: sandbox.stub(),
        }),
    };

    t.context.historicalManager = new HistoricalManager({
        models: [CandleStickCollector],
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        exchange: 'binance',
        symbol: 'BTC/USDT',
        exchangeAPI: {},
        schedulerOptions,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call loadMarketContext, connectCollectors, and startScheduler.', async (t) => {
    const { historicalManager } = t.context;

    const loadMarketContextStub = sandbox
        .stub(historicalManager, 'loadMarketContext')
        .resolves();
    const connectCollectorsStub = sandbox
        .stub(historicalManager, 'connectCollectors')
        .resolves();
    const startSchedulerStub = sandbox
        .stub(historicalManager, 'startScheduler')
        .resolves();

    await historicalManager.start();

    sinon.assert.calledOnce(loadMarketContextStub);
    sinon.assert.calledOnce(connectCollectorsStub);
    sinon.assert.calledOnce(startSchedulerStub);

    t.pass();
});

test('the "initScheduler" method should initialize a HistoricalScheduler with correct options.', async (t) => {
    const { historicalManager } = t.context;

    historicalManager.initScheduler(schedulerOptions);

    t.truthy(
        historicalManager.collectorsScheduler instanceof HistoricalScheduler,
    );

    t.pass();
});
