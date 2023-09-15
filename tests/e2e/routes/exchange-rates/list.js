export default [
    {
        label: 'Positive: exchangeRates list',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get(
                '/exchanges/Binance,KuCoin,Kraken,Gemini/markets/BTC_USDT/exchangeRates',
            );

            t.is(res.data.length, 4);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Positive: exchangeRates list with date ranges',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const oneYearAgo = new Date(
                new Date().setFullYear(new Date().getFullYear() - 1),
            ).toISOString();
            const oneYearFromNow = new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
            ).toISOString();

            const res = await coreAPI.get(
                `/exchanges/Binance,KuCoin,Kraken,Gemini/markets/BTC_USDT/exchangeRates?rangeDateStart=${oneYearAgo}&rangeDateEnd=${oneYearFromNow}`,
            );

            t.is(res.data.length, 4);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: empty exchangeRates list with incorrect exchange name',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get(
                '/exchanges/test/markets/BTC_USDT/exchangeRates',
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: empty exchangeRates list with incorrect symbol name',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get(
                '/exchanges/Binance/markets/BTC_U/exchangeRates',
            );

            t.is(res.data.length, 0);
        },
        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Negative: exchangeRates list with invalid date',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get(
                '/exchanges/Binance,Kraken/markets/BTC_USDT/exchangeRates?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=qq',
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
        label: 'Negative: exchangeRates list with late date start',
        before: async ({ factory }) => {
            await factory.createExchangeRate();
        },
        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get(
                '/exchanges/Binance,Kraken/markets/BTC_USDT/exchangeRates?rangeDateStart=2023-06-05%2001:38:37&?rangeDateStart=2023-06-05%2001:38:37&rangeDateEnd=2023-06-04%2001:38:37',
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
