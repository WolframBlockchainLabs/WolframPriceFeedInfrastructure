/* eslint-disable more/no-hardcoded-configuration-data */
import { rmdir } from 'fs/promises';
import moment    from 'moment';
import News      from '../../../../lib/domain-model/News.js';

export default [
    {
        label  : 'Positive: admin news list',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            const news = await factory.createNews({
                publishTill : moment().add(1, 'hours').format(),
                status      : News.STATUS_PUBLISHED
            });

            return { news, user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).get('/news', {
                createdAt   : JSON.stringify({ from: moment().subtract(1, 'days').format(), to: moment().add(1, 'days').format() }),
                publishedAt : JSON.stringify({ from: moment().subtract(1, 'days').format(), to: moment().add(1, 'days').format() }),
                publishTill : JSON.stringify({ from: moment().subtract(1, 'days').format(), to: moment().add(1, 'days').format() }),
                status      : News.STATUS_PUBLISHED
            });

            t.is(res.status, 1);
            t.truthy(res.data);
            t.is(res.data.length, 1);
        },
        after : async ({ factory }) => {
            await rmdir('storage/news', { recursive: true });
            await factory.cleanup();
        }
    },
    {
        label  : 'Negative: admin news list without permissions',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            return { news };
        },
        test : async ({ t, adminAPI }) => {
            const res = await adminAPI.get('/news');

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_REQUIRED');
        },
        after : async ({ factory }) => {
            await rmdir('storage/news', { recursive: true });
            await factory.cleanup();
        }
    },
    {
        label  : 'Positive: admin news list filtered by category',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            const news = await factory.createNews();

            return { news, user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).get(`/news?category=${News.CATEGORIES[1]}`);

            t.is(res.status, 1);
            t.is(res.data.length, 0);
        },
        after : async ({ factory }) => {
            await rmdir('storage/news', { recursive: true });
            await factory.cleanup();
        }
    }
];
