// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BackoffPolicy from '../../../../../lib/domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';

let sandbox;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.channelStub = {
        addSetup: sandbox.stub().callsFake((cb) => cb()),
        assertExchange: sandbox.stub().resolves(),
        assertQueue: sandbox.stub().resolves({ queue: 'testQueue' }),
        bindQueue: sandbox.stub().resolves(),
        consume: sandbox.stub().resolves(),
        publish: sandbox.stub().resolves(),
    };

    t.context.amqpClientStub = {
        getChannel: sandbox.stub().returns(t.context.channelStub),
    };

    t.context.backoffPolicy = new BackoffPolicy({
        amqpClient: t.context.amqpClientStub,
        rabbitGroupName: 'testGroup',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('BackoffPolicy constructor should initialize with modified rabbitGroupName', (t) => {
    const amqpClient = {};
    const rabbitGroupName = 'testGroup';

    const instance = new BackoffPolicy({ amqpClient, rabbitGroupName });

    t.is(instance.rabbitGroupName, `${rabbitGroupName}::backoff`);

    t.pass();
});

test('broadcastRateLimitChange should call broadcast with the correct rateLimitMultiplier', async (t) => {
    const { backoffPolicy } = t.context;

    const broadcastStub = sinon.stub(backoffPolicy, 'broadcast').resolves();

    const rateLimitMultiplier = 2;

    await backoffPolicy.broadcastRateLimitChange(rateLimitMultiplier);

    sinon.assert.calledOnce(broadcastStub);
    sinon.assert.calledWith(broadcastStub, { rateLimitMultiplier });

    t.pass();
});
