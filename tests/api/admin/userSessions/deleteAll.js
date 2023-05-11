/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */

export default [
    {
        label  : 'Positive: user sessions delete all',
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
            }).delete(`/users/${user.id}/sessions`);

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Positive: user sessions delete all without session folder',
        before : async ({ factory }) => {
            const currentUser = await factory.createActiveUser({ password: 'test-password' });
            const targetUser = await factory.createActiveUser({ password: 'test-password' });

            return { currentUser, targetUser };
        },
        test : async ({ t, adminAPI, currentUser, targetUser }) => {
            const res = await adminAPI.asUser(currentUser).delete(`/users/${targetUser.id}/sessions`);

            t.is(res.status, 1);
        }
    }
];
