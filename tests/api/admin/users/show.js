export default [
    {
        label  : 'Positive: admin users show',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser, targetUser }) => {
            const res = await adminAPI.asUser(contextUser).get(`/users/${targetUser.id}`);

            t.is(res.status, 1);
            t.is(res.data.email, targetUser.email);
        }
    }
];
