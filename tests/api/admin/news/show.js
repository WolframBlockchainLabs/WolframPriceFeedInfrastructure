import { rmdir } from 'fs/promises';

export default [
    {
        label  : 'Positive: admin news show',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const res = await adminAPI.asUser(user).get(`/news/${news.id}`);

            t.is(res.status, 1);
            t.truthy(res.data);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news show with wrong id',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).get('/news/1234');

            t.is(res.status, 0);
            t.is(res.error.code, 'NEWS_NOT_FOUND');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    }
];
