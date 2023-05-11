/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */

export default [
    {
        label  : 'Positive: user sessions list',
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
            }).get(`/users/${user.id}/sessions`);

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length);
        }
    },
    {
        label  : 'Positive: user sessions list (0 sessions)',
        before : async ({ factory }) => {
            const currentUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser();

            return { currentUser, targetUser };
        },
        test : async ({ t, adminAPI, currentUser, targetUser }) => {
            const res = await adminAPI.asUser(currentUser).get(`/users/${targetUser.id}/sessions`);

            t.is(res.status, 1);
            t.is(res.data.length, 0);
        }
    }
];
