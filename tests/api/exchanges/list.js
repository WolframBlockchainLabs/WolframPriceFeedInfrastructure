export default [
    {
        label: 'Positive: exchanges list',
        before: async ({ factory }) => {
            await factory.createExchanges();
        },

        test: async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges');

            console.log(res.length);

            t.is(res.length, 4);
        },

        after: async ({ factory }) => {
            await factory.cleanup();
        },
    },
];
