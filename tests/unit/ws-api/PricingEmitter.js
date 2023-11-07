// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import PricingEmitter from '../../../lib/api/ws-api/emitters/PricingEmitter.js';

let sandbox;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.amqpChannelStub = {
        assertQueue: sandbox.stub(),
        consume: sandbox.stub(),
        addSetup: (func) => func(t.context.amqpChannelStub),
        ack: sandbox.stub(),
    };

    t.context.amqpClientStub = {
        publish: sandbox.stub(),
        getChannel: sandbox.stub().returns(t.context.amqpChannelStub),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.io = {
        emit: sandbox.stub(),
    };

    t.context.pricingEmitter = new PricingEmitter({
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        io: t.context.io,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('run calls super.run() method and initAMQPConnection', async (t) => {
    const { pricingEmitter } = t.context;

    const prototypeRunStub = sandbox.stub(
        Object.getPrototypeOf(PricingEmitter.prototype),
        'run',
    );

    const initAMQPConnectionStub = sandbox.stub(
        pricingEmitter,
        'initAMQPConnection',
    );

    pricingEmitter.run();

    sinon.assert.calledOnce(prototypeRunStub);
    sinon.assert.calledOnce(initAMQPConnectionStub);

    t.pass();
});

test('initAMQPConnection passes setup hook to the amqpClient', async (t) => {
    const { pricingEmitter, amqpChannelStub } = t.context;

    await pricingEmitter.initAMQPConnection();

    sinon.assert.calledOnce(amqpChannelStub.assertQueue);
    sinon.assert.calledOnce(amqpChannelStub.consume);

    t.pass();
});

test('process emits io messages and acknowledges incoming message to rabbitmq', async (t) => {
    const { pricingEmitter, amqpChannelStub, io } = t.context;

    await pricingEmitter.process({
        content: Buffer.from(
            JSON.stringify({
                exchange: 'binance',
                symbol: 'BTC/USDT',
                type: 'Trades',
            }),
        ),
    });

    sinon.assert.calledOnce(io.emit);
    sinon.assert.calledOnce(amqpChannelStub.ack);

    t.pass();
});
