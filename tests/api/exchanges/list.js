/* eslint-disable no-magic-numbers */
let exchanges;

export default [
    {
        label  : 'Positive: exchanges list',
        before : async ({ factory }) => {
            exchanges = await factory.createExchanges();

            return exchanges;
        },

        test : async ({ t, coreAPI }) => {
            const res = await coreAPI.get('/exchanges');

            console.log(res.length);

            t.deepEqual(res, exchanges);
        },

        after : async ({ factory }) => {
            await factory.cleanup();
        }
    }
];
