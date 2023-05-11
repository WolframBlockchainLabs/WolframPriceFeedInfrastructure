import { rmdir } from 'fs/promises';
import News      from '../../../../lib/domain-model/News.js';

export default [
    {
        label  : 'Positive: admin news delete',
        before : async ({ factory }) => {
            const news = await factory.createNews();

            const user = await factory.createActiveUser();

            return { news, user };
        },
        test : async ({ t, adminAPI, news, user }) => {
            const res = await adminAPI.asUser(user).delete(`/news/${news.id}`);

            t.is(res.status, 1);
            t.falsy(res.data);

            let deletedItem = await News.findOne({ where: { id: news.id } });

            t.is(deletedItem, null);

            deletedItem = await News.findOne({ where: { id: news.id }, paranoid: false });

            t.is(deletedItem.id, news.id);
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    },
    {
        label  : 'Negative: admin news delete with wrong id',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).delete('/news/1234');

            t.is(res.status, 0);
            t.is(res.error.code, 'NEWS_NOT_FOUND');
        }
    },
    {
        label  : 'Negative: admin news delete without permissions',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('test');

            const user = await factory.createActiveUser({ roleId });

            const news = await factory.createNews();

            return { user, news };
        },
        test : async ({ t, adminAPI, user, news }) => {
            const res = await adminAPI.asUser(user).delete(`/news/${news.id}`);

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_FORBIDDEN');
        },
        after : async () => {
            await rmdir('storage/news', { recursive: true });
        }
    }
];
