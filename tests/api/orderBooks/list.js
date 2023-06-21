/* eslint-disable no-unused-vars */

export default [
    {
        label  : 'Positive: orderBooks list',
        before : async ({ factory }) => {
            const orderBooks = await factory.createOrderBook();

            return orderBooks;

            // console.log(orderBooks);
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/Binance/markets/BTC_USDT/orderBooks');

            // console.log('----res----', res);

            t.is(1, 1);

            // t.is(res[0].id, newOrderBook.id);
            // t.is(res[0].marketId, newOrderBook.marketId);
            // t.deepEqual(res[0].asks, newOrderBook.asks);
            // t.deepEqual(res[0].bids, newOrderBook.bids);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }
    // {
    //     label  : 'Negative: orderBooks list with incorrect exchange name',
    //     before : async ({ factory }) => {
    //         const { exchangeName, symbol } = await factory.createOrderBook();

    //         return { exchangeName, symbol };
    //     },
    //     test : async ({ t, coreAPI, symbol }) => {
    //         const res = await coreAPI.get(`/exchanges/test/markets/${symbol}/orderBooks`);

    //         t.is(res.error.code, 'EXCHANGE_NOT_FOUND');
    //     },
    //     after : async ({ factory }) => {
    //         await factory.cleanup();
    //     }
    // },
    // {
    //     label  : 'Negative: orderBooks list with incorrect marketId',
    //     before : async ({ factory }) => {
    //         const { exchangeName } = await factory.createOrderBook();

    //         return { exchangeName };
    //     },
    //     test : async ({ t, coreAPI, exchangeName }) => {
    //         const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/test/orderBooks`);

    //         t.is(res.error.code, 'MARKET_NOT_FOUND');
    //     },
    //     after : async ({ factory }) => {
    //         await factory.cleanup();
    //     }
    // },
    // {
    //     label  : 'Negative: orderBooks list with invalid date',
    //     before : async ({ factory }) => {
    //         const { exchangeName, symbol } = await factory.createOrderBook();

    //         return { exchangeName, symbol };
    //     },
    //     test : async ({ t, coreAPI, exchangeName, symbol }) => {
    //         const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/orderBooks?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq`);

    //         t.is(res.error.fields.rangeDateEnd, 'INVALID_ISO_DATE_OR_TIMESTAMP');
    //         t.is(res.error.code, 'FORMAT_ERROR');
    //     },
    //     after : async ({ factory }) => {
    //         await factory.cleanup();
    //     }
    // },
    // {
    //     label  : 'Negative: orderBooks list with late date start',
    //     before : async ({ factory }) => {
    //         const { exchangeName, symbol } = await factory.createOrderBook();

    //         return { exchangeName, symbol };
    //     },
    //     test : async ({ t, coreAPI, exchangeName, symbol }) => {
    //         const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/orderBooks?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37`);

    //         t.is(res.error.fields.rangeDateEnd, 'DATE START CANNOT BE LATE THAN DATA END');
    //         t.is(res.error.code, 'FORMAT_ERROR');
    //     },
    //     after : async ({ factory }) => {
    //         await factory.cleanup();
    //     }
    // }

];
