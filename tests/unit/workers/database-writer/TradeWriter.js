// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import Trade from '../../../../lib/domain-model/entities/Trade.js';
import TradeWriter from '../../../../lib/workers/database-writer/TradeWriter.js';

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

    t.context.TradeStub = {
        findOrCreate: sandbox
            .stub(Trade, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        debug: sandbox.stub(),
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.tradeWriter = new TradeWriter({
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
    const { tradeWriter, TradeStub } = t.context;

    await tradeWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(TradeStub.findOrCreate);

    t.pass();
});

test('the execute method ignores incoming data if its already saved', async (t) => {
    const { tradeWriter, TradeStub } = t.context;

    TradeStub.findOrCreate.returns([{ id: 1 }, false]);
    await tradeWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(TradeStub.findOrCreate);

    t.pass();
});
