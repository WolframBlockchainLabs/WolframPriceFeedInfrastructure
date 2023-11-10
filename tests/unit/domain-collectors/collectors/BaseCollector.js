// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import Collector from '../../../../lib/domain-collectors/collectors/BaseCollector.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const fetchOrderBookStubResult = {
    symbol,
    bids: [[faker.number.float()]],
    asks: [[faker.number.float()]],
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.amqpChannelStub = {
        assertQueue: sandbox.stub(),
    };

    t.context.amqpClientStub = {
        publish: sandbox.stub(),
        getChannel: sandbox.stub().returns({
            addSetup: (func) => func(t.context.amqpChannelStub),
        }),
    };

    t.context.loggerStub = {
        debug: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.collector = new Collector({
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('start method should call fetch and save data', async (t) => {
    const { collector } = t.context;

    sandbox.stub(collector, 'fetchData').resolves(fetchOrderBookStubResult);
    sandbox.stub(collector, 'saveData').resolves();

    await collector.start();

    t.is(undefined, sinon.assert.calledOnce(collector.fetchData));
    t.is(undefined, sinon.assert.calledOnce(collector.saveData));
});

test('calls logger on error', async (t) => {
    const { collector, loggerStub } = t.context;

    sandbox.stub(collector, 'fetchData').throws();

    try {
        await collector.start();

        t.fail();
    } catch {
        t.is(undefined, sinon.assert.calledOnce(collector.fetchData));
        t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
    }
});

test('publish method encapsulates amqpClient', async (t) => {
    const { collector, amqpClientStub } = t.context;

    await collector.publish();

    t.is(undefined, sinon.assert.calledOnce(amqpClientStub.publish));
});

test('initAMQPConnection passes setup hook to the amqpClient', async (t) => {
    const { collector, amqpChannelStub } = t.context;

    await collector.initAMQPConnection();

    t.is(undefined, sinon.assert.calledOnce(amqpChannelStub.assertQueue));
});
