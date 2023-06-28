// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import Exchange from '../../lib/domain-model/entities/Exchange.js';
import Market from '../../lib/domain-model/entities/Market.js';
import CollectorsManager from '../../lib/collectors/CollectorsManager.js';
import CandleStickCollector from '../../lib/collectors/models/CandleStick.js';
import OrderBookCollector from '../../lib/collectors/models/OrderBook.js';
import TickerCollector from '../../lib/collectors/models/Ticker.js';
import TradeCollector from '../../lib/collectors/models/Trade.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const exchangeId = faker.number.int();
const marketId = faker.number.int();

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

    t.context.candleStickSaveStub = sandbox.stub(
        CandleStickCollector.prototype,
        'start',
    );
    t.context.orderBookSaveStub = sandbox.stub(
        OrderBookCollector.prototype,
        'start',
    );
    t.context.tickerSaveStub = sandbox.stub(TickerCollector.prototype, 'start');
    t.context.tradeSaveStub = sandbox.stub(TradeCollector.prototype, 'start');

    t.context.ExchangeStub = {
        findOne: sandbox.stub(Exchange, 'findOne').returns({ id: exchangeId }),
    };
    t.context.MarketStub = {
        findOne: sandbox.stub(Market, 'findOne').returns({ id: marketId }),
    };

    t.context.collectorsManager = new CollectorsManager({
        models: [
            CandleStickCollector,
            OrderBookCollector,
            TickerCollector,
            TradeCollector,
        ],
        logger: t.context.loggerStub,
        amqpClient: t.context.amqpClientStub,
        exchange,
        symbol,
        exchangeAPI: {},
        rabbitMqConfig: {
            urls: [],
        },
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call the "start" method on each model.', async (t) => {
    const {
        collectorsManager,
        candleStickSaveStub,
        orderBookSaveStub,
        tickerSaveStub,
        tradeSaveStub,
    } = t.context;

    await collectorsManager.init();
    await collectorsManager.start();

    t.is(undefined, sinon.assert.calledOnce(candleStickSaveStub));
    t.is(undefined, sinon.assert.calledOnce(orderBookSaveStub));
    t.is(undefined, sinon.assert.calledOnce(tickerSaveStub));
    t.is(undefined, sinon.assert.calledOnce(tradeSaveStub));
});

test('calls logger on error', async (t) => {
    const { collectorsManager, loggerStub, candleStickSaveStub } = t.context;

    candleStickSaveStub.throws();

    await collectorsManager.init();
    await collectorsManager.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
