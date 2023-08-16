// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import ExchangeRate from '../../../../lib/domain-model/entities/ExchangeRate.js';
import ExchangeRateWriter from '../../../../lib/workers/database-writer/ExchangeRateWriter.js';

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

    t.context.ExchangeRateStub = {
        findOrCreate: sandbox
            .stub(ExchangeRate, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeRateWriter = new ExchangeRateWriter({
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
    const { exchangeRateWriter, ExchangeRateStub } = t.context;

    await exchangeRateWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(ExchangeRateStub.findOrCreate);

    t.pass();
});

test('the execute method ignores incoming data if its already saved', async (t) => {
    const { exchangeRateWriter, ExchangeRateStub } = t.context;

    ExchangeRateStub.findOrCreate.returns([{ id: 1 }, false]);
    await exchangeRateWriter.execute({
        exchange: 'binance',
        symbol: 'BTC/EUR',
        payload: {},
    });

    sinon.assert.calledOnce(ExchangeRateStub.findOrCreate);

    t.pass();
});
