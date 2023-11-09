// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import XRPLDriver from '../../../../../../lib/domain-collectors/integrations/xrpl/driver/XRPLDriver.js';

let sandbox;

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

    t.context.xrplClientStub = {
        connect: sandbox.stub(),
        disconnect: sandbox.stub(),
        request: sandbox.stub().returns({ result: { offers: {} } }),
    };

    t.context.xrplDriver = new XRPLDriver('ws://test');

    t.context.xrplDriver.client = t.context.xrplClientStub;
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "connect" method should call connect on client.', async (t) => {
    const { xrplDriver, xrplClientStub } = t.context;

    await xrplDriver.connect();

    t.is(undefined, sinon.assert.calledOnce(xrplClientStub.connect));
});

test('the "disconnect" method should call disconnect on client.', async (t) => {
    const { xrplDriver, xrplClientStub } = t.context;

    await xrplDriver.disconnect();

    t.is(undefined, sinon.assert.calledOnce(xrplClientStub.disconnect));
});

test('the "loadOrders" method should call request on client.', async (t) => {
    const { xrplDriver, xrplClientStub } = t.context;

    await xrplDriver.loadOrders(pair);

    t.is(undefined, sinon.assert.calledTwice(xrplClientStub.request));
});

test('the "fetchOrderBook" method should call loadOrders and format the result.', async (t) => {
    const { xrplDriver } = t.context;

    const loadOrdersStub = sinon.stub(xrplDriver, 'loadOrders').returns({
        asks: [{ quality: 1, TakerGets: { value: 1 } }],
        bids: [{ quality: 1, TakerPays: { value: 1 } }],
    });

    const result = await xrplDriver.fetchOrderBook(pair);

    t.is(undefined, sinon.assert.calledOnce(loadOrdersStub));
    t.deepEqual(result, {
        asks: [[1, 1]],
        bids: [[1, 1]],
    });
});
