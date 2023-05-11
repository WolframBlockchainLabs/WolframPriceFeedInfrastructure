import Session from './../../../../lib/domain-model/Session.js';

export default [
    {
        label  : 'Positive: sessions list',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            const sessions = [
                await factory.createUserSession(user.id),
                await factory.createUserSession(user.id),
                await factory.createUserSession(user.id)
            ];

            return { user, sessions };
        },
        test : async ({ t, adminAPI, user, sessions }) => {
            const res = await adminAPI.asUserSession({
                userId    : user.id,
                sessionId : sessions[0].sid
            }).get('/sessions');

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length);
            t.is(res.data[0].ip, '::ffff:127.0.0.1');
            t.is(res.data[1].ip, '::ffff:127.0.0.1');
            t.is(res.data[2].ip, '::ffff:127.0.0.1');
            t.is(res.data[0].browser, 'node-fetch');
            t.is(res.data[1].browser, 'node-fetch');
            t.is(res.data[2].browser, 'node-fetch');
            t.is(res.data[0].version, '1.0');
            t.is(res.data[1].version, '1.0');
            t.is(res.data[2].version, '1.0');

            const count = await Session.count();

            t.is(count, sessions.length);
        }
    },
    {
        label : 'Negative: sessions list without session',
        test  : async ({ t, adminAPI }) => {
            const res = await adminAPI.get('/sessions');

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_REQUIRED');
        }
    }
];
