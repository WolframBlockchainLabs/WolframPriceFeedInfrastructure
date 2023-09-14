// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import BaseTezosDriver from '../../../../../lib/collectors/integrations/tezos/BaseTezosDriver.js';

let sandbox;

const storage = 'storage';

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.baseTezosDriver = new BaseTezosDriver('test');

    t.context.baseTezosDriver.tezosClient = {
        contract: {
            at() {
                return {
                    storage() {
                        return storage;
                    },
                };
            },
        },
    };
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "getExchangeRate" method should format pair and get quote.', async (t) => {
    const { baseTezosDriver } = t.context;

    const result = await baseTezosDriver.getContractStorage();

    t.is(result, storage);
});
