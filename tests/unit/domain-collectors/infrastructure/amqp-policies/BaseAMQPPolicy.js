// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BaseAMQPPolicy from '../../../../../lib/domain-collectors/infrastructure/amqp-policies/BaseAMQPPolicy.js';

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

    t.context.baseAMQPPolicy = new BaseAMQPPolicy({
        amqpClient: t.context.amqpClientStub,
        rabbitGroupName: 'testGroup',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should set reloadHandler and call setupReplicaChannel.', async (t) => {
    const { baseAMQPPolicy } = t.context;

    const setupReplicaChannelStub = sandbox.stub(
        baseAMQPPolicy,
        'setupReplicaChannel',
    );

    await baseAMQPPolicy.start(() => {});

    sinon.assert.calledOnce(setupReplicaChannelStub);

    t.pass();
});

test('the "setupReplicaChannel" method pass configureRabbitMQChannel into amqp addSetup.', async (t) => {
    const { baseAMQPPolicy, amqpClientStub, channelStub } = t.context;

    const configureRabbitMQChannelStub = sandbox.stub(
        baseAMQPPolicy,
        'configureRabbitMQChannel',
    );

    await baseAMQPPolicy.setupReplicaChannel();

    sinon.assert.calledOnce(amqpClientStub.getChannel);
    sinon.assert.calledOnce(channelStub.addSetup);
    sinon.assert.calledOnce(configureRabbitMQChannelStub);

    t.pass();
});

test('the "configureRabbitMQChannel" should call assertExchange, assertAndBindQueue, and setupConsumer.', async (t) => {
    const { baseAMQPPolicy, channelStub } = t.context;

    await baseAMQPPolicy.configureRabbitMQChannel(channelStub);

    sinon.assert.calledWith(channelStub.assertExchange, 'testGroup', 'fanout', {
        durable: false,
    });
    sinon.assert.calledOnce(channelStub.assertQueue);
    sinon.assert.calledOnce(channelStub.bindQueue);
    sinon.assert.calledOnce(channelStub.consume);

    t.pass();
});

test('the "broadcast" should publish a message to the channel.', async (t) => {
    const { baseAMQPPolicy } = t.context;
    const rateLimitMultiplier = 2;

    await baseAMQPPolicy.broadcast({ rateLimitMultiplier });

    const expectedMessage = Buffer.from(
        JSON.stringify({ rateLimitMultiplier }),
    );
    sinon.assert.calledWith(
        baseAMQPPolicy.amqpClient.getChannel().publish,
        'testGroup',
        '',
        expectedMessage,
    );

    t.pass();
});

test('consumer should call the handler with the provided message', async (t) => {
    const { baseAMQPPolicy } = t.context;

    const mockHandler = sinon.stub().resolves();
    baseAMQPPolicy.handler = mockHandler;

    const mockMessage = { content: 'test message' };

    await baseAMQPPolicy.consumer(mockMessage);

    sinon.assert.calledOnce(mockHandler);
    sinon.assert.calledWith(mockHandler, mockMessage);

    t.pass();
});

test('getPrivateQueueAddress should return the rabbitQueueId', (t) => {
    const { baseAMQPPolicy } = t.context;

    baseAMQPPolicy.rabbitQueueId = 'testQueueId';

    const result = baseAMQPPolicy.getPrivateQueueAddress();

    t.is(result, 'testQueueId');

    t.pass();
});
