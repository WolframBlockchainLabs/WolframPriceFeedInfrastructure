
export default [
    {
        label  : 'Positive: exchanges list',
        before : async ({ factory }) => {
            const exchange = await factory.createExchange();

            return { exchange };
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges');

            t.is(res.length, 1);
        },
        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }
];
