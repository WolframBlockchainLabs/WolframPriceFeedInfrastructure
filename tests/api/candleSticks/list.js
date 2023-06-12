
export default [
    {
        label  : 'Positive: candleSticks list',
        before : async ({ factory }) => {
            const { exchangeName, symbol, newCandleStick } = await factory.createCandleStick();

            return { exchangeName, symbol, newCandleStick };
        },
        test : async ({ t, coreAPI, exchangeName, symbol, newCandleStick }) => {
            const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/candleSticks`);

            t.is(res[0].id, newCandleStick.id);
            t.is(res[0].marketId, newCandleStick.marketId);
            t.truthy(res[0].charts.length > 0);
            t.is(res[0].charts.length, newCandleStick.charts.length);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: candleSticks list with incorrect exchange name',
        before : async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createCandleStick();

            return { exchangeName, symbol };
        },
        test : async ({ t, coreAPI, symbol }) => {
            const res = await coreAPI.get(`/exchanges/test/markets/${symbol}/candleSticks`);

            t.is(res.error.code, 'EXCHANGE_NOT_FOUND');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: candleSticks list with incorrect marketId',
        before : async ({ factory }) => {
            const { exchangeName } = await factory.createCandleStick();

            return { exchangeName };
        },
        test : async ({ t, coreAPI, exchangeName }) => {
            const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/test/candleSticks`);

            t.is(res.error.code, 'MARKET_NOT_FOUND');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: candleSticks list with invalid date',
        before : async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createCandleStick();

            return { exchangeName, symbol };
        },
        test : async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/candleSticks?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq`);

            t.is(res.error.fields.rangeDateEnd, 'INVALID_ISO_DATE_OR_TIMESTAMP');
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: candleSticks list with late date start',
        before : async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createCandleStick();

            return { exchangeName, symbol };
        },
        test : async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(`/exchanges/${exchangeName}/markets/${symbol}/candleSticks?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37`);

            t.is(res.error.fields.rangeDateEnd, 'DATE START CANNOT BE LATE THAN DATA END');
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }

];
