export default [
    {
        label: 'Positive: aggregateCandleSticks list',
        before: async ({ factory }) => {
            return factory.createCandleStick();
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const oneYearAgo = new Date(
                new Date().setFullYear(new Date().getFullYear() - 1),
            ).toISOString();
            const oneYearFromNow = new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
            ).toISOString();

            const res = await coreAPI.get(
                `/candleSticks/aggregate?rangeDateStart=${oneYearAgo}&rangeDateEnd=${oneYearFromNow}&symbols[]=${symbol}&exchangeNames[]=${exchangeName}`,
            );

            t.is(res.data.rangeDateStart, oneYearAgo);
            t.is(res.data.rangeDateEnd, oneYearFromNow);
            t.truthy(res.data.aggregatedPairs[symbol]);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: aggregateCandleSticks list with invalid date',
        before: async ({ factory }) => {
            return factory.createCandleStick();
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/candleSticks/aggregate?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq&symbols[]=${symbol}&exchangeNames[]=${exchangeName}`,
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
        label: 'Negative: aggregateCandleSticks list with late date start',
        before: async ({ factory }) => {
            return factory.createCandleStick();
        },
        test: async ({ t, coreAPI, exchangeName, symbol }) => {
            const res = await coreAPI.get(
                `/candleSticks/aggregate?rangeDateStart=2023-06-05&rangeDateEnd=2023-06-04&symbols[]=${symbol}&exchangeNames[]=${exchangeName}`,
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
