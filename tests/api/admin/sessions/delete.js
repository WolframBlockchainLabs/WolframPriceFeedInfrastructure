import Session from './../../../../lib/domain-model/Session.js';

export default [
    {
        label  : 'Positive: sessions delete',
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
            }).delete(`/sessions/${sessions[1].sid}`);

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length - 1);
        }
    },
    {
        label  : 'Positive: sessions delete current',
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
            }).delete(`/sessions/${sessions[0].sid}`);

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length - 1);

            const count = await Session.count();

            t.is(count, sessions.length - 1);
        }
    }
];
