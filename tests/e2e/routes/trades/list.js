export default [
    {
        label: 'Positive: trades list',
        before: async ({ factory }) => {
            const { exchangeName, symbol, newTrade } =
                await factory.createTrade();

            return {
                exchangeName,
                symbol: symbol.replace(/\//g, '_'),
                newTrade,
            };
        },
        test: async ({ t, coreAPI, exchangeName, symbol, newTrade }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/trades`,
            );

            t.is(res.data[0].id, newTrade.id);
            t.is(res.data[0].marketId, newTrade.marketId);
            t.deepEqual(res.data[0].tradesInfo, newTrade.tradesInfo);
            t.is(res.data[0].bid, newTrade.bid);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Positive: trades list with date ranges',
        before: async ({ factory }) => {
            const { exchangeName, symbol, newTrade } =
                await factory.createTrade();

            return {
                exchangeName,
                symbol: symbol.replace(/\//g, '_'),
                newTrade,
            };
        },
        test: async ({ t, coreAPI, exchangeName, symbol, newTrade }) => {
            const oneYearAgo = new Date(
                new Date().setFullYear(new Date().getFullYear() - 1),
            ).toISOString();
            const oneYearFromNow = new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
            ).toISOString();

            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/trades?rangeDateStart=${oneYearAgo}&rangeDateEnd=${oneYearFromNow}`,
            );

            t.is(res.data[0].id, newTrade.id);
            t.is(res.data[0].marketId, newTrade.marketId);
            t.deepEqual(res.data[0].tradesInfo, newTrade.tradesInfo);
            t.is(res.data[0].bid, newTrade.bid);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: trades list with incorrect exchange name',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTrade();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/test/markets/${symbol}/trades`,
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: trades list with incorrect marketId',
        before: async ({ factory }) => {
            const { exchangeName } = await factory.createTrade();

            return { exchangeName };
        },
        test: async ({ t, coreAPI, exchangeName }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/test/trades`,
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: trades list with invalid date',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTrade();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/trades?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq`,
            );

            t.is(
                res.error.fields.rangeDateEnd,
                'INVALID_ISO_DATE_OR_TIMESTAMP',
            );
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: trades list with late date start',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTrade();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/trades?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37`,
            );

            t.is(
                res.error.fields.rangeDateEnd,
                'DATE START CANNOT BE LATE THAN DATA END',
            );
            t.is(res.error.code, 'FORMAT_ERROR');
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
];
