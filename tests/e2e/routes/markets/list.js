export default [
    {
        label: 'Positive: markets list',
        before: async ({ factory }) => {
            await factory.createMarkets();
        },

        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/markets');

            t.is(res.data.length, 4);
        },

        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Positive: markets list with specified exchanges',
        before: async ({ factory }) => {
            await factory.createMarkets();
        },

        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/markets?exchangeNames[]=Binance');

            t.is(res.data.length, 1);
        },

        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
    {
        label: 'Positive: markets list with specified tokens',
        before: async ({ factory }) => {
            await factory.createMarkets();
        },

        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/markets?tokenNames[]=BTC');

            t.is(res.data.length, 4);
        },

        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
];
