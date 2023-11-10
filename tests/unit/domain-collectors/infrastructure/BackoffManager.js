// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BackoffPolicy from '../../../../lib/domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';

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

test('the "start" method should set reloadHandler and call setupReplicaChannel.', async (t) => {
    const { backoffPolicy } = t.context;

    const setupReplicaChannelStub = sandbox.stub(
        backoffPolicy,
        'setupReplicaChannel',
    );

    await backoffPolicy.start(() => {});

    sinon.assert.calledOnce(setupReplicaChannelStub);

    t.pass();
});

test('the "setupReplicaChannel" method pass configureRabbitMQChannel into amqp addSetup.', async (t) => {
    const { backoffPolicy, amqpClientStub, channelStub } = t.context;

    const configureRabbitMQChannelStub = sandbox.stub(
        backoffPolicy,
        'configureRabbitMQChannel',
    );

    await backoffPolicy.setupReplicaChannel();

    sinon.assert.calledOnce(amqpClientStub.getChannel);
    sinon.assert.calledOnce(channelStub.addSetup);
    sinon.assert.calledOnce(configureRabbitMQChannelStub);

    t.pass();
});

test('the "configureRabbitMQChannel" should call assertExchange, assertAndBindQueue, and setupConsumer.', async (t) => {
    const { backoffPolicy, channelStub } = t.context;

    await backoffPolicy.configureRabbitMQChannel(channelStub);

    sinon.assert.calledWith(channelStub.assertExchange, 'testGroup', 'fanout', {
        durable: false,
    });
    sinon.assert.calledOnce(channelStub.assertQueue);
    sinon.assert.calledOnce(channelStub.bindQueue);
    sinon.assert.calledOnce(channelStub.consume);

    t.pass();
});

test('the "broadcastRateLimitChange" should publish a message to the channel.', async (t) => {
    const { backoffPolicy } = t.context;
    const rateLimitMultiplier = 2;

    await backoffPolicy.broadcastRateLimitChange(rateLimitMultiplier);

    const expectedMessage = Buffer.from(
        JSON.stringify({ rateLimitMultiplier }),
    );
    sinon.assert.calledWith(
        backoffPolicy.amqpClient.getChannel().publish,
        'testGroup',
        '',
        expectedMessage,
    );

    t.pass();
});
