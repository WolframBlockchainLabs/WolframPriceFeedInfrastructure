import News from '../../../../lib/domain-model/News.js';

export default [
    {
        label  : 'Positive: news list',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            return { news };
        },
        test : async ({ t, userAPI }) => {
            const res = await userAPI.get('/news');

            t.is(res.status, 1);
            t.truthy(res.data);
        }
    },
    {
        label  : 'Positive: news list filtered by category',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                category : News.CATEGORIES[0]
            });

            return { news };
        },
        test : async ({ t, userAPI }) => {
            const res = await userAPI.get(`/news?category=${News.CATEGORIES[1]}`);

            t.is(res.status, 1);
            t.is(res.data.length, 0);
        }
    },
    {
        label  : 'Positive: news list translation UA',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                status : News.STATUS_PUBLISHED
            });

            return { news };
        },
        test : async ({ t, userAPI, news }) => {
            const res = await userAPI.get('/news');

            const translation = await news.getTranslation('ua');

            t.is(res.status, 1);
            t.is(res.data[0].ua.title, translation.title);
        }
    },
    {
        label  : 'Positive: news list translation RU',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                status : News.STATUS_PUBLISHED
            });

            return { news };
        },
        test : async ({ t, userAPI, news }) => {
            const res = await userAPI.get('/news', {}, {
                'Accept-Language' : 'ru'
            });

            const translation = await news.getTranslation('ru');

            t.is(res.status, 1);
            t.is(res.data[0].ru.title, translation.title);
        }
    },
    {
        label  : 'Positive: news list translation search',
        before : async ({ factory }) => {
            const news = await factory.createNews({
                status : News.STATUS_PUBLISHED
            });

            return { news };
        },
        test : async ({ t, userAPI, news }) => {
            const translation = await news.getTranslation('ru');

            const res = await userAPI.get(`/news?search=${translation.title}`, {}, {
                'Accept-Language' : 'ru'
            });

            t.is(res.status, 1);
            t.is(res.data[0].ru.title, translation.title);
        }
    }
];
