import { rmdir } from 'fs/promises';

export default [
    {
        label  : 'Positive: news show',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            return { news };
        },
        test : async ({ t, userAPI, news }) => {
            const res = await userAPI.get(`/news/${news.slug}`);

            t.is(res.status, 1);
            t.truthy(res.data);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: news show with wrong id',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            return { news };
        },
        test : async ({ t, userAPI }) => {
            const res = await userAPI.get('/news/1234');

            t.is(res.status, 0);
            t.is(res.error.code, 'NEWS_NOT_FOUND');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    }
];
