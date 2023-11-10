// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import OrderBook from '../../../../lib/domain-model/entities/OrderBook.js';
import OrderBookWriter from '../../../../lib/workers/database-writer/OrderBookWriter.js';

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

    t.context.OrderBookStub = {
        findOrCreate: sandbox
            .stub(OrderBook, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        debug: sandbox.stub(),
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.orderBookWriter = new OrderBookWriter({
        logger: t.context.loggerStub,
        sequelize: {},
        amqpClient: t.context.amqpClientStub,
        consumerConfig: {},
        config: {
            retryLimit: 3,
            retryPeriodMs: 3000,
        },
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method saves incoming data if its not already saved', async (t) => {
    const { orderBookWriter, OrderBookStub } = t.context;

    await orderBookWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(OrderBookStub.findOrCreate);

    t.pass();
});

test('the execute method ignores incoming data if its already saved', async (t) => {
    const { orderBookWriter, OrderBookStub } = t.context;

    OrderBookStub.findOrCreate.returns([{ id: 1 }, false]);
    await orderBookWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(OrderBookStub.findOrCreate);

    t.pass();
});
