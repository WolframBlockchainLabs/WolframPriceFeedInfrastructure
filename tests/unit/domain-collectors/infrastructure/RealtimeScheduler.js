// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cron from 'node-cron';
import cronParser from 'cron-parser';
import RealtimeScheduler from '../../../../lib/domain-collectors/infrastructure/schedulers/RealtimeScheduler.js';

let sandbox;

const intraIntervalDistance = 1440;
const normalizedInterval = 1;
const interval = '*/1 * * * *';
const desyncTimeoutForCollector = 36000;
const firstOperationDesync = 7500;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    const mutexReleaseStub = sandbox.stub();
    const mutexAcquireStub = sandbox.stub().returns(mutexReleaseStub);

    t.context.mutexStub = {
        acquire: mutexAcquireStub,
        release: mutexReleaseStub,
    };

    t.context.setTimeoutStub = sandbox
        .stub(global, 'setTimeout')
        .callsFake((cb) => cb());

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.realtimeScheduler = new RealtimeScheduler({
        logger: t.context.loggerStub,
        baseRateLimit: 50,
        rateLimitMargin: 10,
        operationsAmount: 4,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
    });

    t.context.realtimeScheduler.startMutex = t.context.mutexStub;
    t.context.realtimeScheduler.stopMutex = t.context.mutexStub;
    t.context.realtimeScheduler.reloadMutex = t.context.mutexStub;
    t.context.realtimeScheduler.updateRTMMutex = t.context.mutexStub;
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should start initialization, setup a critical section and wait one cycle.', async (t) => {
    const { realtimeScheduler, mutexStub } = t.context;

    const setHandlerStub = sandbox.stub(realtimeScheduler, 'setHandler');
    const setMultiplierStub = sandbox.stub(realtimeScheduler, 'setMultiplier');
    const initializeSchedulerStub = sandbox.stub(
        realtimeScheduler,
        'initializeScheduler',
    );
    const waitOneCycleStub = sandbox.stub(realtimeScheduler, 'waitOneCycle');

    await realtimeScheduler.start({});

    sinon.assert.calledOnce(mutexStub.acquire);
    sinon.assert.calledOnce(mutexStub.release);
    sinon.assert.calledOnce(setHandlerStub);
    sinon.assert.calledOnce(setMultiplierStub);
    sinon.assert.calledOnce(initializeSchedulerStub);
    sinon.assert.calledOnce(waitOneCycleStub);

    t.pass();
});

test('the "stop" method stop cron task, setup a critical section and wait one cycle.', async (t) => {
    const { realtimeScheduler, mutexStub } = t.context;

    const waitOneCycleStub = sandbox.stub(realtimeScheduler, 'waitOneCycle');
    const cronTaskStopStub = sandbox.stub();

    realtimeScheduler.cronTask = {
        stop: cronTaskStopStub,
    };

    await realtimeScheduler.stop();

    sinon.assert.calledOnce(mutexStub.acquire);
    sinon.assert.calledOnce(mutexStub.release);
    sinon.assert.calledOnce(waitOneCycleStub);
    sinon.assert.calledOnce(cronTaskStopStub);

    t.pass();
});

test('the "reload" method calls stop and then start method, sets up a critical section', async (t) => {
    const { realtimeScheduler, mutexStub } = t.context;

    const startStub = sandbox.stub(realtimeScheduler, 'start');
    const stopStub = sandbox.stub(realtimeScheduler, 'stop');

    await realtimeScheduler.reload();

    sinon.assert.calledOnce(mutexStub.acquire);
    sinon.assert.calledOnce(mutexStub.release);
    sinon.assert.calledOnce(startStub);
    sinon.assert.calledOnce(stopStub);

    t.pass();
});

test('the "updateRateLimitMultiplier" method reloads cron if the new backoff multiplier is valid, and sets up a critical section', async (t) => {
    const { realtimeScheduler, mutexStub } = t.context;

    const getMultiplierBackoffStub = sandbox.stub(
        realtimeScheduler,
        'getMultiplierBackoff',
    );
    const validateMultiplierStub = sandbox
        .stub(realtimeScheduler, 'validateMultiplier')
        .returns(true);
    const reloadStub = sandbox.stub(realtimeScheduler, 'reload');

    await realtimeScheduler.updateRateLimitMultiplier();

    sinon.assert.calledOnce(mutexStub.acquire);
    sinon.assert.calledOnce(mutexStub.release);
    sinon.assert.calledOnce(getMultiplierBackoffStub);
    sinon.assert.calledOnce(validateMultiplierStub);
    sinon.assert.calledOnce(reloadStub);

    t.pass();
});

test('the "updateRateLimitMultiplier" method skips reload if the new backoff multiplier is not valid, and sets up a critical section', async (t) => {
    const { realtimeScheduler, mutexStub } = t.context;

    const getMultiplierBackoffStub = sandbox.stub(
        realtimeScheduler,
        'getMultiplierBackoff',
    );
    const validateMultiplierStub = sandbox.stub(
        realtimeScheduler,
        'validateMultiplier',
    );
    const reloadStub = sandbox.stub(realtimeScheduler, 'reload');

    await realtimeScheduler.updateRateLimitMultiplier();

    sinon.assert.calledOnce(mutexStub.acquire);
    sinon.assert.calledOnce(mutexStub.release);
    sinon.assert.calledOnce(getMultiplierBackoffStub);
    sinon.assert.calledOnce(validateMultiplierStub);
    sinon.assert.notCalled(reloadStub);

    t.pass();
});

test('the "runCollectors" method updates intervalBounds and calls handler', async (t) => {
    const { realtimeScheduler } = t.context;

    const updateIntervalBoundsStub = sandbox.stub(
        realtimeScheduler,
        'updateIntervalBounds',
    );
    const handlerStub = sandbox.stub();

    realtimeScheduler.handler = handlerStub;

    await realtimeScheduler.runCollectors();

    sinon.assert.calledOnce(updateIntervalBoundsStub);
    sinon.assert.calledOnce(handlerStub);

    t.pass();
});

test('the "waitOneCycle" method timeouts execution for one cycle', async (t) => {
    const { realtimeScheduler, setTimeoutStub } = t.context;

    await realtimeScheduler.waitOneCycle();

    sinon.assert.calledOnce(setTimeoutStub);

    t.pass();
});

test('the "initializeScheduler" method calls interval initialization and cron task setup', async (t) => {
    const { realtimeScheduler } = t.context;

    const calculateIntervalPropertiesStub = sandbox.stub(
        realtimeScheduler,
        'calculateIntervalProperties',
    );
    const setupCronTaskStub = sandbox.stub(realtimeScheduler, 'setupCronTask');

    await realtimeScheduler.initializeScheduler();

    sinon.assert.calledOnce(calculateIntervalPropertiesStub);
    sinon.assert.calledOnce(setupCronTaskStub);

    t.pass();
});

test('the "calculateIntervalProperties" method sets properties for cron scheduler', async (t) => {
    const { realtimeScheduler } = t.context;

    realtimeScheduler.calculateIntervalProperties();

    t.is(realtimeScheduler.intraIntervalDistance, intraIntervalDistance);
    t.is(realtimeScheduler.normalizedInterval, normalizedInterval);
    t.is(realtimeScheduler.interval, interval);

    t.pass();
});

test('the "setupCronTask" method must setup cron schedule', async (t) => {
    const { realtimeScheduler } = t.context;

    const cronParserStub = sandbox.stub(cronParser, 'parseExpression');
    const scheduleStub = sandbox
        .stub(cron, 'schedule')
        .callsFake((_, cb) => cb());
    const calculateDesyncTimeoutForCollectorStub = sandbox.stub(
        realtimeScheduler,
        'calculateDesyncTimeoutForCollector',
    );
    const runCollectorsStub = sandbox.stub(realtimeScheduler, 'runCollectors');

    realtimeScheduler.setupCronTask();

    sinon.assert.calledOnce(cronParserStub);
    sinon.assert.calledOnce(scheduleStub);
    sinon.assert.calledOnce(calculateDesyncTimeoutForCollectorStub);
    sinon.assert.calledOnce(runCollectorsStub);

    t.pass();
});

test('the "calculateDesyncTimeoutForCollector" method returns desync value', async (t) => {
    const { realtimeScheduler } = t.context;

    realtimeScheduler.calculateIntervalProperties();
    const desync = realtimeScheduler.calculateDesyncTimeoutForCollector();

    t.is(desync, desyncTimeoutForCollector);
});

test('the "updateIntervalBounds" method updates intervalStart and intervalEnd props', async (t) => {
    const { realtimeScheduler } = t.context;

    const scheduleStub = {
        prev: sandbox.stub().returns({ toDate: () => new Date() }),
        next: sandbox.stub().returns({ toDate: () => new Date() }),
    };

    realtimeScheduler.schedule = scheduleStub;

    realtimeScheduler.updateIntervalBounds();

    sinon.assert.calledOnce(scheduleStub.prev);
    sinon.assert.calledTwice(scheduleStub.next);

    t.pass();
});

test('the "getOperationDesync" returns desync value for each operation', async (t) => {
    const { realtimeScheduler } = t.context;

    realtimeScheduler.calculateIntervalProperties();
    const desync = realtimeScheduler.getOperationDesync(1);

    t.is(desync, firstOperationDesync);
});

test('the "setHandler" method validates and sets handler', async (t) => {
    const { realtimeScheduler } = t.context;

    const handlerStub = sandbox.stub();

    realtimeScheduler.setHandler(handlerStub);

    t.is(realtimeScheduler.handler, handlerStub);
});

test('the "setHandler" throws if handler is not passed', async (t) => {
    const { realtimeScheduler } = t.context;

    t.throws(() => realtimeScheduler.setHandler());
});

test('the "validateMultiplier" returns false if multiplier is invalid', async (t) => {
    const { realtimeScheduler } = t.context;

    const isValid = realtimeScheduler.validateMultiplier(0);

    t.is(isValid, false);
});

test('the "validateMultiplier" returns true if multiplier is valid', async (t) => {
    const { realtimeScheduler } = t.context;

    const isValid = realtimeScheduler.validateMultiplier(2);

    t.is(isValid, true);
});

test('the "setMultiplier" sets a new multiplier if it is valid', async (t) => {
    const { realtimeScheduler } = t.context;

    const newMultiplier = 2;

    t.is(
        realtimeScheduler.rateLimitMultiplier,
        RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
    );

    realtimeScheduler.setMultiplier(newMultiplier);

    t.is(realtimeScheduler.rateLimitMultiplier, newMultiplier);

    realtimeScheduler.rateLimitMultiplier =
        RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER;
});

test('the "setMultiplier" skips if a new multiplier is invalid', async (t) => {
    const { realtimeScheduler } = t.context;

    const newMultiplier = 0;

    t.is(
        realtimeScheduler.rateLimitMultiplier,
        RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
    );

    realtimeScheduler.setMultiplier(newMultiplier);

    t.is(
        realtimeScheduler.rateLimitMultiplier,
        RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
    );
});

test('the "getMultiplierBackoff" returns next multiplier', async (t) => {
    const { realtimeScheduler } = t.context;

    const expectedNewMultiplier = 2;

    t.is(
        realtimeScheduler.rateLimitMultiplier,
        RealtimeScheduler.DEFAULT_RATE_LIMIT_MULTIPLIER,
    );

    const newMultiplier = realtimeScheduler.getMultiplierBackoff();

    t.is(newMultiplier, expectedNewMultiplier);
});

test('the "getIntervalBounds" returns intervalStart and intervalEnd', async (t) => {
    const { realtimeScheduler } = t.context;

    const defaultBounds = {
        intervalStart: null,
        intervalEnd: null,
    };

    const bounds = realtimeScheduler.getIntervalBounds();

    t.deepEqual(bounds, defaultBounds);
});
