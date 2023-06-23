/* eslint-disable no-magic-numbers */
export default [
    {
        label  : 'Positive: orderBooks list',
        before : async ({ factory }) => {
            const orderBooks = await factory.createOrderBook();

            return orderBooks;
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/Binance,KuCoin,Kraken,Gemini/markets/BTC_USDT/orderBooks');

            t.is(res.length, 4);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: empty orderBooks list with incorrect exchange name',
        before : async ({ factory }) => {
            await factory.createOrderBook();
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/test/markets/BTC_USDT/orderBooks');

            t.is(res.length, 0);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: empty orderBooks list with incorrect symbol name',
        before : async ({ factory }) => {
            await factory.createOrderBook();
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/Binance/markets/BTC_U/orderBooks');

            t.is(res.length, 0);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: orderBooks list with invalid date',
        before : async ({ factory }) => {
            await factory.createOrderBook();
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/Binance,Kraken/markets/BTC_USDT/orderBooks?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq');

            t.is(res.error.fields.rangeDateEnd, 'INVALID_ISO_DATE_OR_TIMESTAMP');
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: orderBooks list with late date start',
        before : async ({ factory }) => {
            await factory.createOrderBook();
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges/Binance,Kraken/markets/BTC_USDT/orderBooks?rangeDateStart=2023-06-05%2001:38:37&?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37');

            t.is(res.error.fields.rangeDateEnd, 'DATE START CANNOT BE LATE THAN DATA END');
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }

];
