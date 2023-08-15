// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import XRPLOrderBookCollector from '../../../../../lib/collectors/integrations/xrpl/models/XRPLOrderBook.js';
import XRPLCollectorsManager from '../../../../../lib/collectors/integrations/xrpl/XRPLCollectorsManager.js';
import CollectorsManager from '../../../../../lib/collectors/CollectorsManager.js';

let sandbox;

const exchange = 'xrpl';
const symbol = 'XRP/USD';
const pair = {
    base: {
        currency: 'XRP',
    },
    counter: {
        currency: 'USD',
        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
    },
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };
    t.context.amqpClientStub = {
        getChannel: sandbox.stub().returns({
            addSetup: sandbox.stub(),
        }),
    };
    t.context.exchangeAPIStub = {
        connect: sandbox.stub(),
    };

    t.context.orderBookSaveStub = sandbox.stub(
        XRPLOrderBookCollector.prototype,
        'start',
    );

    t.context.collectorsManager = new XRPLCollectorsManager({
        models: [XRPLOrderBookCollector],
        pair,
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        exchange,
        symbol,
        exchangeAPI: t.context.exchangeAPIStub,
        rabbitMqConfig: {
            urls: [],
        },
        rateLimit: 50,
        rateLimitMargin: 10,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call connect on exchangeApi and start on super.', async (t) => {
    const { collectorsManager, exchangeAPIStub } = t.context;

    const startStub = sinon.stub(CollectorsManager.prototype, 'start');

    await collectorsManager.start();

    t.is(undefined, sinon.assert.calledOnce(startStub));
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.connect));
});
