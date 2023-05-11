export default [
    {
        label  : 'Positive: admin seo item show',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, adminAPI, user, item }) => {
            await user.load('profile');

            const res = await adminAPI.asUser(user).get(`/seo/${item.id}`);

            t.is(res.status, 1);
            t.is(res.data.name, item.name);
        }
    },
    {
        label  : 'Negative: admin seo item show with wrong id',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, adminAPI, user }) => {
            await user.load('profile');

            const res = await adminAPI.asUser(user).get('/seo/1234312');

            t.is(res.status, 0);
            t.is(res.error.code, 'SEOITEM_NOT_FOUND');
        }
    }
];
