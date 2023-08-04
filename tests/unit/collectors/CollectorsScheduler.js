// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import cron from 'node-cron';
import CollectorsScheduler from '../../../lib/collectors/CollectorsScheduler.js';

let sandbox;

const intraIntervalDistance = 1440;
const normalizedInterval = 1;
const interval = '*/1 * * * *';
const firstOperationDesync = 7500;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.cronStub = sandbox
        .stub(cron, 'schedule')
        .callsFake((interval, cb) => cb());
    t.context.setTimeoutStub = sandbox.stub(global, 'setTimeout');

    t.context.collectorsScheduler = new CollectorsScheduler({
        rateLimit: 50,
        rateLimitMargin: 10,
        operationsAmount: 4,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call setupInterval and setupSchedule.', async (t) => {
    const { collectorsScheduler } = t.context;

    const setupIntervalStub = sandbox.stub(
        collectorsScheduler,
        'setupInterval',
    );
    const setupScheduleStub = sandbox.stub(
        collectorsScheduler,
        'setupSchedule',
    );

    collectorsScheduler.start();

    t.is(undefined, sinon.assert.calledOnce(setupIntervalStub));
    t.is(undefined, sinon.assert.calledOnce(setupScheduleStub));
});

test('the "runCollectors" method should call the "setNextInterval" method.', async (t) => {
    const { collectorsScheduler } = t.context;

    const setNextIntervalStub = sandbox.stub(
        collectorsScheduler,
        'setNextInterval',
    );

    await collectorsScheduler.runCollectors();

    t.is(undefined, sinon.assert.calledOnce(setNextIntervalStub));
});

test('sets intraIntervalDistance, normalizedInterval, and interval on setupInterval call', async (t) => {
    const { collectorsScheduler } = t.context;

    t.is(collectorsScheduler.intraIntervalDistance, null);
    t.is(collectorsScheduler.normalizedInterval, null);
    t.is(collectorsScheduler.interval, null);

    collectorsScheduler.setupInterval();

    t.is(collectorsScheduler.intraIntervalDistance, intraIntervalDistance);
    t.is(collectorsScheduler.normalizedInterval, normalizedInterval);
    t.is(collectorsScheduler.interval, interval);

    collectorsScheduler.intraIntervalDistance = null;
    collectorsScheduler.normalizedInterval = null;
    collectorsScheduler.interval = null;
});

test('getOperationDesync calculates offset of an individual operation', async (t) => {
    const { collectorsScheduler } = t.context;

    collectorsScheduler.setupInterval();
    const desync = collectorsScheduler.getOperationDesync(1);

    t.is(desync, firstOperationDesync);

    collectorsScheduler.intraIntervalDistance = null;
    collectorsScheduler.normalizedInterval = null;
    collectorsScheduler.interval = null;
});
