
export default [
    {
        label  : 'Positive: exchanges list',
        before : async ({ factory }) => {
            const exchange = await factory.createExchange();

            return { exchange };
        },
        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges');

            console.log(res);

            t.truthy(res);
            // t.is(res.status, 1);
            // t.is(res.data.length, EXPECTED_ROLES_COUNT);
            // t.is(res.meta.totalCount, EXPECTED_ROLES_COUNT);
        }
    }
];
