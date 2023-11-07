// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import AggregateOHLCVEmitter from '../../../lib/api/ws-api/emitters/AggregateOHLCVEmitter.js';

let sandbox;

let config = {
    aggregateOHLCVEmitter: {
        interval: 1000,
        exchanges: [
            'Binance',
            'Bitfinex',
            'Bitget',
            'Bitstamp',
            'Bybit',
            'Gate.io',
            'Gemini',
            'Kraken',
            'KuCoin',
            'OKX',
        ],
        pairs: ['BTC/EUR', 'BTC/USDT', 'ETH/USDT', 'ETH/EUR', 'LTC/BTC'],
    },
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.amqpClientStub = {};

    t.context.setIntervalStub = sandbox.stub(global, 'setInterval');

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.io = {
        emit: sandbox.stub(),
    };

    t.context.aggregateCandleSticks = {
        execute: sandbox.stub(),
    };

    t.context.aggregateOHLCVEmitter = new AggregateOHLCVEmitter({
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        io: t.context.io,
        config,
    });

    t.context.aggregateOHLCVEmitter.aggregateCandleSticks =
        t.context.aggregateCandleSticks;
});

test.afterEach(() => {
    sandbox.restore();
});

test('run calls super.run() method and schedules emitter', async (t) => {
    const { aggregateOHLCVEmitter, setIntervalStub } = t.context;

    const prototypeRunStub = sandbox.stub(
        Object.getPrototypeOf(AggregateOHLCVEmitter.prototype),
        'run',
    );

    aggregateOHLCVEmitter.run();

    sinon.assert.calledOnce(prototypeRunStub);
    sinon.assert.calledOnce(setIntervalStub);

    t.pass();
});

test('process calls fetchAggregation method and emits io event', async (t) => {
    const { aggregateOHLCVEmitter, io } = t.context;

    const fetchAggregationStub = sandbox.stub(
        aggregateOHLCVEmitter,
        'fetchAggregation',
    );

    await aggregateOHLCVEmitter.process();

    sinon.assert.calledOnce(fetchAggregationStub);
    sinon.assert.calledOnce(io.emit);

    t.pass();
});

test('fetchAggregation executes aggregateCandleSticks use-case', async (t) => {
    const { aggregateOHLCVEmitter, aggregateCandleSticks } = t.context;

    await aggregateOHLCVEmitter.fetchAggregation();

    sinon.assert.calledOnce(aggregateCandleSticks.execute);

    t.pass();
});
