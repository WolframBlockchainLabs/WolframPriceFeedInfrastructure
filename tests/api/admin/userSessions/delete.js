/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */

export default [
    {
        label  : 'Positive: user sessions delete',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: 'test-password' });

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
            }).delete(`/users/${user.id}/sessions/${sessions[1].sid}`);

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length - 1);
        }
    },
    {
        label  : 'Positive: user sessions delete with wrong Id',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: 'test-password' });

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
            }).delete(`/users/${user.id}/sessions/${sessions[1].sid}test`);

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_NOT_FOUND');
        }
    }
];
