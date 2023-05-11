import faker from 'faker';

export default [
    {
        label  : 'Positive: admin seo item create',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/seo', {
                name         : faker.random.words(),
                index        : 'noindex',
                follow       : 'nofollow',
                translations : {
                    'ru' : {
                        lang        : 'ru',
                        url         : faker.lorem.sentence(),
                        header      : faker.lorem.sentence(),
                        description : faker.lorem.sentence(),
                        keywords    : faker.lorem.sentence(),
                        title       : faker.lorem.sentence(),
                        canonical   : faker.lorem.sentence(),
                        text        : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang        : 'ua',
                        url         : faker.lorem.sentence(),
                        header      : faker.lorem.sentence(),
                        description : faker.lorem.sentence(),
                        keywords    : faker.lorem.sentence(),
                        title       : faker.lorem.sentence(),
                        canonical   : faker.lorem.sentence(),
                        text        : faker.lorem.sentence()
                    }
                }
            });

            t.is(res.status, 1);
            t.truthy(res.data);
        }
    },
    {
        label  : 'Negative: admin seo item create with wrong index value',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/seo', {
                name         : faker.random.words(),
                index        : faker.random.words(),
                follow       : 'nofollow',
                translations : {
                    'ru' : {
                        lang        : 'ru',
                        url         : faker.lorem.sentence(),
                        header      : faker.lorem.sentence(),
                        description : faker.lorem.sentence(),
                        keywords    : faker.lorem.sentence(),
                        title       : faker.lorem.sentence(),
                        canonical   : faker.lorem.sentence(),
                        text        : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang        : 'ua',
                        url         : faker.lorem.sentence(),
                        header      : faker.lorem.sentence(),
                        description : faker.lorem.sentence(),
                        keywords    : faker.lorem.sentence(),
                        title       : faker.lorem.sentence(),
                        canonical   : faker.lorem.sentence(),
                        text        : faker.lorem.sentence()
                    }
                }
            });

            t.is(res.status, 0);
            t.is(res.error.fields.index, 'NOT_ALLOWED_VALUE');
        }
    },
    {
        label  : 'Negative: admin seo item create without required field',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/seo', {
                index        : faker.random.words(),
                follow       : 'nofollow',
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

            t.is(res.status, 0);
            t.is(res.error.fields.name, 'REQUIRED');
        }
    }
];
