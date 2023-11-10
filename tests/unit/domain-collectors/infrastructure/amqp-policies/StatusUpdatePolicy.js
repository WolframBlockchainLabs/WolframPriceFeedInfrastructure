// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import StatusUpdatePolicy from '../../../../../lib/domain-collectors/infrastructure/amqp-policies/StatusUpdatePolicy.js';

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
        publish: sandbox.stub(),
    };

    t.context.statusUpdatePolicy = new StatusUpdatePolicy({
        amqpClient: t.context.amqpClientStub,
        rabbitGroupName: 'testGroup',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('StatusUpdatePolicy constructor should initialize with modified rabbitGroupName', (t) => {
    const amqpClient = {};
    const rabbitGroupName = 'testGroup';

    const instance = new StatusUpdatePolicy({ amqpClient, rabbitGroupName });

    t.is(instance.rabbitGroupName, `${rabbitGroupName}::status`);

    t.pass();
});

test('start should set handlers, call super start, and broadcast REQUEST message', async (t) => {
    const { statusUpdatePolicy } = t.context;

    const getStatusHandler = sandbox.stub().resolves();
    const updateHandler = sandbox.stub().resolves();
    const superStartStub = sandbox.stub(
        Object.getPrototypeOf(StatusUpdatePolicy.prototype),
        'start',
    );
    const broadcastStub = sandbox
        .stub(statusUpdatePolicy, 'broadcast')
        .resolves();

    await statusUpdatePolicy.start({ getStatusHandler, updateHandler });

    sinon.assert.calledOnce(superStartStub);
    sinon.assert.calledOnce(broadcastStub);
    sinon.assert.calledWith(broadcastStub, {
        type: StatusUpdatePolicy.MESSAGE_TYPES.REQUEST,
        data: {
            statusUpdateQueue: statusUpdatePolicy.getPrivateQueueAddress(),
        },
    });

    t.pass();
});

test('consumer should call appropriate consumer based on message type', async (t) => {
    const { statusUpdatePolicy } = t.context;
    const requestConsumerStub = sandbox
        .stub(statusUpdatePolicy, 'requestConsumer')
        .resolves();
    const updateConsumerStub = sandbox
        .stub(statusUpdatePolicy, 'updateConsumer')
        .resolves();

    const requestMessage = {
        content: Buffer.from(
            JSON.stringify({
                type: StatusUpdatePolicy.MESSAGE_TYPES.REQUEST,
                data: {},
            }),
        ),
    };
    const updateMessage = {
        content: Buffer.from(
            JSON.stringify({
                type: StatusUpdatePolicy.MESSAGE_TYPES.UPDATE,
                data: {},
            }),
        ),
    };

    await statusUpdatePolicy.consumer(requestMessage);
    await statusUpdatePolicy.consumer(updateMessage);

    sinon.assert.calledOnce(requestConsumerStub);
    sinon.assert.calledOnce(updateConsumerStub);

    t.pass();
});

test('requestConsumer should publish status update', async (t) => {
    const { statusUpdatePolicy, amqpClientStub } = t.context;

    const getStatusHandlerStub = sandbox
        .stub()
        .resolves({ currentStatus: 'OK' });
    statusUpdatePolicy.getStatusHandler = getStatusHandlerStub;

    const statusUpdateQueue = 'statusQueue';
    await statusUpdatePolicy.requestConsumer({ statusUpdateQueue });

    sinon.assert.calledOnce(getStatusHandlerStub);
    sinon.assert.calledOnce(amqpClientStub.publish);
    sinon.assert.calledWith(amqpClientStub.publish, statusUpdateQueue, {
        type: StatusUpdatePolicy.MESSAGE_TYPES.UPDATE,
        data: { currentStatus: 'OK' },
    });

    t.pass();
});

test('updateConsumer should call updateHandler with newRateLimitMultiplier', async (t) => {
    const { statusUpdatePolicy } = t.context;

    const updateHandlerStub = sandbox.stub().resolves();
    statusUpdatePolicy.updateHandler = updateHandlerStub;

    const newRateLimitMultiplier = 1.5;
    await statusUpdatePolicy.updateConsumer({ newRateLimitMultiplier });

    sinon.assert.calledOnce(updateHandlerStub);
    sinon.assert.calledWith(updateHandlerStub, newRateLimitMultiplier);

    t.pass();
});
