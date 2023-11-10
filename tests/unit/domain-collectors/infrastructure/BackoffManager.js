// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BackoffManager from '../../../../lib/domain-collectors/infrastructure/BackoffManager.js';

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

    t.context.backoffManager = new BackoffManager({
        amqpClient: t.context.amqpClientStub,
        rabbitGroupName: 'testGroup',
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should set reloadHandler and call setupReplicaChannel.', async (t) => {
    const { backoffManager } = t.context;

    const setupReplicaChannelStub = sandbox.stub(
        backoffManager,
        'setupReplicaChannel',
    );

    await backoffManager.start(() => {});

    sinon.assert.calledOnce(setupReplicaChannelStub);

    t.pass();
});

test('the "setupReplicaChannel" method pass configureRabbitMQChannel into amqp addSetup.', async (t) => {
    const { backoffManager, amqpClientStub, channelStub } = t.context;

    const configureRabbitMQChannelStub = sandbox.stub(
        backoffManager,
        'configureRabbitMQChannel',
    );

    await backoffManager.setupReplicaChannel();

    sinon.assert.calledOnce(amqpClientStub.getChannel);
    sinon.assert.calledOnce(channelStub.addSetup);
    sinon.assert.calledOnce(configureRabbitMQChannelStub);

    t.pass();
});

test('the "configureRabbitMQChannel" should call assertExchange, assertAndBindQueue, and setupConsumer.', async (t) => {
    const { backoffManager, channelStub } = t.context;

    await backoffManager.configureRabbitMQChannel(channelStub);

    sinon.assert.calledWith(channelStub.assertExchange, 'testGroup', 'fanout', {
        durable: false,
    });
    sinon.assert.calledOnce(channelStub.assertQueue);
    sinon.assert.calledOnce(channelStub.bindQueue);
    sinon.assert.calledOnce(channelStub.consume);

    t.pass();
});

test('the "broadcastRateLimitChange" should publish a message to the channel.', async (t) => {
    const { backoffManager } = t.context;
    const rateLimitMultiplier = 2;

    await backoffManager.broadcastRateLimitChange(rateLimitMultiplier);

    const expectedMessage = Buffer.from(
        JSON.stringify({ rateLimitMultiplier }),
    );
    sinon.assert.calledWith(
        backoffManager.amqpClient.getChannel().publish,
        'testGroup',
        '',
        expectedMessage,
    );

    t.pass();
});
