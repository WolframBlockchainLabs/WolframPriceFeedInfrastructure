import { rmdir } from 'fs/promises';
import faker     from 'faker';
import News      from '../../../../lib/domain-model/News.js';

export default [
    {
        label  : 'Positive: admin news update',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const result = await adminAPI.asUser(user).patch(`/news/${news.id}`, {
                status       : News.STATUS_DRAFT,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2021-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang            : 'ua',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 1);
            t.is(result.data.translations.ru.lang, 'ru');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Positive: admin news update and rewrite publishedAT',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                publishedAt : new Date(),
                status      : News.STATUS_PUBLISHED
            });

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const result = await adminAPI.asUser(user).patch(`/news/${news.id}`, {
                status       : News.STATUS_DRAFT,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2020-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang            : 'ua',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 1);
            t.is(result.data.publishedAt, null);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Positive: admin news update and rewrite publishTill',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                publishedAt : new Date(),
                status      : News.STATUS_PUBLISHED
            });

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const result = await adminAPI.asUser(user).patch(`/news/${news.id}`, {
                status       : News.STATUS_DRAFT,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2020-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang            : 'ua',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 1);
            t.is(result.data.publishedAt, null);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Positive: admin news publish without image',
        before : async ({ factory }) => {
            const news = await factory.createNews({}, {});

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const result = await adminAPI.asUser(user).patch(`/news/${news.id}`, {
                status       : News.STATUS_PUBLISHED,
                category     : News.CATEGORY_REVIEWS,
                publishTill  : '2021-12-19',
                translations : {
                    'ru' : {
                        lang            : 'ru',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    },
                    'ua' : {
                        lang            : 'ua',
                        title           : faker.lorem.sentence(),
                        previewContent  : faker.lorem.sentence(),
                        content         : faker.lorem.text(),
                        seoContent      : faker.lorem.text(),
                        metaTitle       : faker.lorem.sentence(),
                        metaKeywords    : faker.lorem.sentence(),
                        metaDescription : faker.lorem.sentence()
                    }
                }
            });

            t.is(result.status, 0);
            t.is(result.error.code, 'PREVIEW_IMG_REQUIRED');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news update with wrong id',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const result = await adminAPI.asUser(user).patch('/news/12313123', {
                content : faker.lorem.text()
            });

            t.is(result.status, 0);
            t.is(result.error.code, 'NEWS_NOT_FOUND');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news update without permissions',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('test');

            const user = await factory.createActiveUser({ roleId });

            const news = await factory.createNews();

            return { user, news };
        },
        test : async ({ t, adminAPI, user, news }) => {
            const res = await adminAPI.asUser(user).patch(`/news/${news.id}`, {
                title : faker.lorem.words()
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_FORBIDDEN');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    }
];
