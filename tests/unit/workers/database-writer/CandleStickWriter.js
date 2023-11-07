// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import CandleStickWriter from '../../../../lib/workers/database-writer/CandleStickWriter.js';
import CandleStick from '../../../../lib/domain-model/entities/CandleStick.js';

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

    t.context.CandleStickStub = {
        findOrCreate: sandbox
            .stub(CandleStick, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.candleStickWriter = new CandleStickWriter({
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
    const { candleStickWriter, CandleStickStub } = t.context;

    await candleStickWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(CandleStickStub.findOrCreate);

    t.pass();
});

test('the execute method ignores incoming data if its already saved', async (t) => {
    const { candleStickWriter, CandleStickStub } = t.context;

    CandleStickStub.findOrCreate.returns([{ id: 1 }, false]);
    await candleStickWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(CandleStickStub.findOrCreate);

    t.pass();
});
