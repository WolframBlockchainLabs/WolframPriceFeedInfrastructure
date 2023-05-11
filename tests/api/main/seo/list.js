export default [
    {
        label  : 'Positive: seo items list',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            await factory.createSeoItem();

            return { user };
        },
        test : async ({ t, userAPI, user }) => {
            const res = await userAPI.asUser(user).get('/seo');

            t.is(res.status, 1);
            t.is(res.data.length, 1);
            t.is(res.meta.totalCount, 1);
        }
    },
    {
        label  : 'Positive: seo items list with search',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, userAPI, user, item }) => {
            const filteredUrls = item.translations.filter(translation => translation.field === 'url');
            const res          = await userAPI.asUser(user).get(`/seo?search=${filteredUrls[0].value}`);

            t.is(res.status, 1);
            t.is(res.data.length, 1);
            t.is(res.meta.totalCount, 1);
        }
    }
];
