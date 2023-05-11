import faker          from 'faker';

const TEST_VALUE = 'Some text';

export default [
    {
        label  : 'Positive: admin seo item update',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const item = await factory.createSeoItem();

            return { user, item };
        },
        test : async ({ t, adminAPI, user, item }) => {
            const res = await adminAPI.asUser(user).patch(`/seo/${item.id}`, {
                name         : TEST_VALUE,
                translations : {
                    'ru' : {
                        lang : 'ru',
                        url  : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang : 'ua',
                        url  : faker.lorem.sentence()
                    }
                }
            });

            t.is(res.status, 1);
            t.is(res.data.name, TEST_VALUE);
        }
    }
];
