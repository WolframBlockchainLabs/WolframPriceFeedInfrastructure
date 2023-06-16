// eslint-disable-next-line import/no-unresolved
import test from "ava";
import sinon from "sinon";
import { faker } from "@faker-js/faker";
import { CollectorManager } from "../../lib/collector/startCollectors.js";
import { OrderBookCollector } from "../../lib/collector/OrderBook.js";
import { CandleStickCollector } from "../../lib/collector/CandleStick.js";
import { TickerCollector } from "../../lib/collector/Ticker.js";
import { TradeCollector } from "../../lib/collector/Trade.js";

let sandbox;

let getMarketInfoStub;

let orderBookCollectorStub;

let candleStickCollectorStub;

let tickerCollectorStub;

let tradeCollectorStub;

const getMarketInfoStubResult = { marketId: faker.number.int() };

test.beforeEach(() => {
  sandbox = sinon.createSandbox();

  getMarketInfoStub = sandbox.stub();

  orderBookCollectorStub = sandbox.stub(OrderBookCollector.prototype, "start");
  candleStickCollectorStub = sandbox.stub(
    CandleStickCollector.prototype,
    "start"
  );
  tickerCollectorStub = sandbox.stub(TickerCollector.prototype, "start");
  tradeCollectorStub = sandbox.stub(TradeCollector.prototype, "start");

  getMarketInfoStub.resolves(getMarketInfoStubResult);
});

test.afterEach(() => {
  sandbox.restore();
});

test("Collector Manager process method", async (t) => {
  const exchange = "binance";
  const symbols = [faker.word.noun()];
  const db = { sequelize: faker.word.noun() };

  const manager = new CollectorManager({
    db,
    marketService: { getMarketInfo: getMarketInfoStub },
  });

  await manager.process(exchange, symbols);

  t.is(
    undefined,
    sinon.assert.calledOnceWithExactly(getMarketInfoStub, exchange, symbols[0])
  );
  t.is(undefined, sinon.assert.calledOnce(orderBookCollectorStub));
  t.is(undefined, sinon.assert.calledOnce(candleStickCollectorStub));
  t.is(undefined, sinon.assert.calledOnce(tickerCollectorStub));
  t.is(undefined, sinon.assert.calledOnce(tradeCollectorStub));
});
