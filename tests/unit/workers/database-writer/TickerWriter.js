// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import Ticker from '../../../../lib/domain-model/entities/Ticker.js';
import TickerWriter from '../../../../lib/workers/database-writer/TickerWriter.js';

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

    t.context.TickerStub = {
        findOrCreate: sandbox
            .stub(Ticker, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.tickerWriter = new TickerWriter({
        logger: t.context.loggerStub,
        sequelize: {},
        amqpClient: t.context.amqpClientStub,
        consumerConfig: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method saves incoming data if its not already saved', async (t) => {
    const { tickerWriter, TickerStub } = t.context;

    await tickerWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(TickerStub.findOrCreate);

    t.pass();
});

test('the execute method ignores incoming data if its already saved', async (t) => {
    const { tickerWriter, TickerStub } = t.context;

    TickerStub.findOrCreate.returns([{ id: 1 }, false]);
    await tickerWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(TickerStub.findOrCreate);

    t.pass();
});
