export default [
    {
        label  : 'Positive: admin seo item delete',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, adminAPI, user, item }) => {
            const res = await adminAPI.asUser(user).delete(`/seo/${item.id}`);

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: admin seo item delete with wrong id',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).delete('/seo/12344311');

            t.is(res.status, 0);
            t.is(res.error.code, 'SEOITEM_NOT_FOUND');
        }
    }
];
