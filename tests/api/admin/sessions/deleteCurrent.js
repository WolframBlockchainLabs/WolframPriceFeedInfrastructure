export default [
    {
        label  : 'Positive: sessions delete this',
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
            }).delete('/sessions');

            t.is(res.status, 1);
            t.is(res.data.length, sessions.length - 1);
        }
    }
];
