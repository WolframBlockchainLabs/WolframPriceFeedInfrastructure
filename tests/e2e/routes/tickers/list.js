export default [
    {
        label: 'Positive: tickers list',
        before: async ({ factory }) => {
            const { exchangeName, symbol, newTicker } =
                await factory.createTicker();

            return {
                exchangeName,
                symbol: symbol.replace(/\//g, '_'),
                newTicker,
            };
        },
        test: async ({ t, coreAPI, exchangeName, symbol, newTicker }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/tickers`,
            );

            t.is(res.data[0].id, newTicker.id);
            t.is(res.data[0].marketId, newTicker.marketId);
            t.is(res.data[0].askVolume, newTicker.askVolume);
            t.is(res.data[0].bid, newTicker.bid);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Positive: tickers list with date ranges',
        before: async ({ factory }) => {
            const { exchangeName, symbol, newTicker } =
                await factory.createTicker();

            return {
                exchangeName,
                symbol: symbol.replace(/\//g, '_'),
                newTicker,
            };
        },
        test: async ({ t, coreAPI, exchangeName, symbol, newTicker }) => {
            const oneYearAgo = new Date(
                new Date().setFullYear(new Date().getFullYear() - 1),
            ).toISOString();
            const oneYearFromNow = new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
            ).toISOString();

            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/tickers?rangeDateStart=${oneYearAgo}&rangeDateEnd=${oneYearFromNow}`,
            );

            t.is(res.data[0].id, newTicker.id);
            t.is(res.data[0].marketId, newTicker.marketId);
            t.is(res.data[0].askVolume, newTicker.askVolume);
            t.is(res.data[0].bid, newTicker.bid);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: tickers list with incorrect exchange name',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTicker();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/test/markets/${symbol}/tickers`,
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: tickers list with incorrect marketId',
        before: async ({ factory }) => {
            const { exchangeName } = await factory.createTicker();

            return { exchangeName };
        },
        test: async ({ t, coreAPI, exchangeName }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/test/tickers`,
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: tickers list with invalid date',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTicker();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/tickers?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq`,
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
        label: 'Negative: tickers list with late date start',
        before: async ({ factory }) => {
            const { exchangeName, symbol } = await factory.createTicker();

            return { exchangeName, symbol: symbol.replace(/\//g, '_') };
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/exchanges/${exchangeName}/markets/${symbol}/tickers?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37`,
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
