export default [
    {
        label  : 'Positive: seo item show with first translation',
        before : async ({ factory }) => {
            const item = await factory.createSeoItem();

            return { item };
        },
        test : async ({ t, userAPI, item }) => {
            const filteredUrls = item.translations.filter(translation => translation.field === 'url');
            const res          = await userAPI.get(`/seo/${filteredUrls[0].value}`);

            t.is(res.status, 1);
            t.is(res.data.name, item.name);
        }
    },
    {
        label  : 'Positive: seo item show with second translation',
        before : async ({ factory }) => {
            const item = await factory.createSeoItem();

            return { item };
        },
        test : async ({ t, userAPI, item }) => {
            const filteredUrls = item.translations.filter(translation => translation.field === 'url');
            const res          = await userAPI.get(`/seo/${filteredUrls[1].value}`);

            t.is(res.status, 1);
            t.is(res.data.name, item.name);
        }
    },
    {
        label  : 'Negative: seo item show with wrong url',
        before : async ({ factory }) => {
            const item = await factory.createSeoItem();

            return { item };
        },
        test : async ({ t, userAPI }) => {
            const res = await userAPI.get('/seo/1234312');

            t.is(res.status, 1);
            t.is(res.data, null);
        }
    }
];
