// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import CollectorsManager from '../../../lib/domain-collectors/CollectorsManager.js';
import CandleStickCollector from '../../../lib/domain-collectors/collectors/CandleStickCollector.js';
import Exchange from '../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../lib/domain-model/entities/Market.js';

let sandbox;

const schedulerOptions = {
    baseRateLimit: 50,
    rateLimitMargin: 10,
    operationsAmount: 4,
    queuePosition: 3,
    queueSize: 5,
    replicaSize: 2,
    instancePosition: 1,
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

    t.context.setTimeoutStub = sandbox
        .stub(global, 'setTimeout')
        .callsFake((cb) => cb());

    t.context.collectorsManager = new CollectorsManager({
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

test('constructor should initialize scheduler, backoff manager, and properties.', (t) => {
    const { collectorsManager } = t.context;

    t.truthy(collectorsManager.collectorsScheduler);
    t.truthy(collectorsManager.backoffPolicy);

    t.pass();
});

test('the "start" method should call necessary methods for setup.', async (t) => {
    const { collectorsManager } = t.context;

    const loadMarketContextStub = sandbox
        .stub(collectorsManager, 'loadMarketContext')
        .resolves();
    const connectCollectorsStub = sandbox
        .stub(collectorsManager, 'connectCollectors')
        .resolves();
    const startBackoffPolicyStub = sandbox
        .stub(collectorsManager, 'startBackoffPolicy')
        .resolves();
    const startStatusUpdatePolicyStub = sandbox
        .stub(collectorsManager, 'startStatusUpdatePolicy')
        .resolves();
    const startSchedulerStub = sandbox
        .stub(collectorsManager, 'startScheduler')
        .resolves();

    await collectorsManager.start();

    sinon.assert.calledOnce(loadMarketContextStub);
    sinon.assert.calledOnce(connectCollectorsStub);
    sinon.assert.calledOnce(startBackoffPolicyStub);
    sinon.assert.calledOnce(startStatusUpdatePolicyStub);
    sinon.assert.calledOnce(startSchedulerStub);

    t.pass();
});

test('the "runCollectors" method should handle collector startups and log errors if any.', async (t) => {
    const { collectorsManager, loggerStub } = t.context;

    const mockCollector1 = {
        start: sandbox.stub().resolves(),
        getName: sandbox.stub().returns('Collector1'),
    };
    const mockCollector2 = {
        start: sandbox.stub().rejects(new Error('Test Error')),
        getName: sandbox.stub().returns('Collector2'),
    };

    collectorsManager.collectors = [mockCollector1, mockCollector2];
    const startCollectorWithDelayStub = sandbox
        .stub(collectorsManager, 'startCollectorWithDelay')
        .callsFake((collector) => collector.start());

    await collectorsManager.runCollectors();

    sinon.assert.calledWith(startCollectorWithDelayStub, mockCollector1);
    sinon.assert.calledWith(startCollectorWithDelayStub, mockCollector2);
    sinon.assert.calledOnce(loggerStub.error); // Assuming error logging happens once due to the mockCollector2's failure

    t.pass();
});

test('the "startCollectorWithDelay" method should delay collector start, then start it, and handle errors.', async (t) => {
    const { collectorsManager, loggerStub, setTimeoutStub } = t.context;

    const mockCollector = {
        start: sandbox.stub().resolves(),
        getName: sandbox.stub().returns('MockCollector'),
        setInterval: sandbox.stub(),
    };

    const getOperationDesyncStub = sandbox
        .stub(collectorsManager.collectorsScheduler, 'getOperationDesync')
        .returns(1000);

    const broadcastRateLimitChangeStub = sandbox
        .stub(collectorsManager.backoffPolicy, 'broadcastRateLimitChange')
        .resolves();

    await collectorsManager.startCollectorWithDelay(mockCollector, 0);

    sinon.assert.calledWith(getOperationDesyncStub, 0);
    sinon.assert.calledOnce(setTimeoutStub);
    sinon.assert.calledOnce(mockCollector.start);
    sinon.assert.notCalled(loggerStub.error);
    sinon.assert.notCalled(broadcastRateLimitChangeStub);

    mockCollector.start.rejects(new Error('Test Error'));
    await collectorsManager.startCollectorWithDelay(mockCollector, 0);

    sinon.assert.calledTwice(setTimeoutStub);
    sinon.assert.calledTwice(mockCollector.start);
    sinon.assert.calledOnce(loggerStub.error);
    sinon.assert.calledOnce(broadcastRateLimitChangeStub);

    t.pass();
});

test('the "loadMarketContext" method should set the marketId correctly.', async (t) => {
    const { collectorsManager } = t.context;

    const mockExchange = { id: 1, externalExchangeId: 'binance' };
    const mockMarket = {
        id: 2,
        exchangeId: mockExchange.id,
        symbol: 'BTC/USDT',
    };

    const exchangeFindOneStub = sandbox
        .stub(Exchange, 'findOneOrFail')
        .resolves(mockExchange);
    const marketFindOneStub = sandbox
        .stub(Market, 'findOneOrFail')
        .resolves(mockMarket);

    await collectorsManager.loadMarketContext();

    sinon.assert.calledWith(exchangeFindOneStub, {
        where: { externalExchangeId: collectorsManager.exchange },
    });
    sinon.assert.calledWith(marketFindOneStub, {
        where: {
            exchangeId: mockExchange.id,
            symbol: collectorsManager.symbol,
        },
    });
    t.is(collectorsManager.marketId, mockMarket.id);

    t.pass();
});

test('the "connectCollectors" method should initialize and connect collectors.', async (t) => {
    const { collectorsManager } = t.context;

    class MockCollector {
        constructor({ amqpClient }) {
            this.amqpClient = amqpClient;
        }

        async initAMQPConnection() {}
    }

    collectorsManager.models = [MockCollector];

    const initCollectorsStub = sandbox
        .stub(collectorsManager, 'initCollectors')
        .callsFake(() => {
            collectorsManager.collectors = [
                new MockCollector({ amqpClient: t.context.amqpClientStub }),
            ];
        });

    const initAMQPConnectionStub = sandbox
        .stub(MockCollector.prototype, 'initAMQPConnection')
        .resolves();

    await collectorsManager.connectCollectors();

    sinon.assert.calledOnce(initCollectorsStub);
    sinon.assert.calledOnce(initAMQPConnectionStub);

    t.pass();
});

test('the "startScheduler" method should start the scheduler with the correct handler.', async (t) => {
    const { collectorsManager } = t.context;

    const schedulerStartStub = sandbox
        .stub(collectorsManager.collectorsScheduler, 'start')
        .resolves();

    await collectorsManager.startScheduler();

    sinon.assert.calledWith(schedulerStartStub);

    t.pass();
});

test('the "startBackoffPolicy" method should start the backoff manager with the correct handler.', async (t) => {
    const { collectorsManager } = t.context;

    const backoffPolicyStartStub = sandbox
        .stub(collectorsManager.backoffPolicy, 'start')
        .resolves();

    await collectorsManager.startBackoffPolicy();

    sinon.assert.calledWith(backoffPolicyStartStub);

    t.pass();
});

test('the "startStatusUpdatePolicy" method should start the status update policy with the correct handlers.', async (t) => {
    const { collectorsManager } = t.context;

    const statusUpdatePolicyStartStub = sandbox
        .stub(collectorsManager.statusUpdatePolicy, 'start')
        .resolves();

    await collectorsManager.startStatusUpdatePolicy();

    sinon.assert.calledWith(statusUpdatePolicyStartStub);

    t.pass();
});

test('the "initCollectors" method should initialize collector instances from models.', (t) => {
    const { collectorsManager } = t.context;

    class MockCollector {
        constructor(config) {
            this.config = config;
        }
    }

    collectorsManager.models = [MockCollector];

    collectorsManager.initCollectors();

    t.is(collectorsManager.collectors.length, 1);
    t.true(collectorsManager.collectors[0] instanceof MockCollector);

    const expectedConfig = {
        logger: collectorsManager.logger,
        exchange: collectorsManager.exchange,
        symbol: collectorsManager.symbol,
        pair: collectorsManager.pair,
        marketId: collectorsManager.marketId,
        exchangeAPI: collectorsManager.exchangeAPI,
        amqpClient: collectorsManager.amqpClient,
    };
    t.deepEqual(collectorsManager.collectors[0].config, expectedConfig);

    t.pass();
});
