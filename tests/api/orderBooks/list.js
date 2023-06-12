
export default [
    {
        label  : 'Positive: orderBooks list',
        before : async ({ factory }) => {
            const { exchangeName, symbol, newOrderBook } = await factory.createOrderBook();

            return { exchangeName, symbol, newOrderBook };
        },
        test : async ({ t, coreAPI, exchangeName, symbol, newOrderBook }) => {
            const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/orderBooks`);

            t.is(res[0].marketId, newOrderBook.marketId);
            t.deepEqual(res[0].asks, newOrderBook.asks);
            t.deepEqual(res[0].bids, newOrderBook.bids);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: orderBooks list with incorrect exchange name',
        before : async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createOrderBook();

            return { exchangeName, symbol };
        },
        test : async ({ t, coreAPI, symbol }) => {
            const res = await coreAPI.get(`/exchanges/test/markets/${symbol}/orderBooks`);

            t.is(res.error.code, 'SESSION_REQUIRED');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }


];
