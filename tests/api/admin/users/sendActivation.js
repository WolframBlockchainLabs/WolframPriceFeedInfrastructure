/* eslint-disable more/no-hardcoded-configuration-data */
export default [
    {
        label  : 'Positive: admin users resend activation',
        before : async ({ factory }) => {
            const targetUser = await factory.createUser();
            const user = await factory.createActiveUser();

            return { user, targetUser };
        },
        test : async ({ t, adminAPI, user, targetUser }) => {
            const res = await adminAPI.asUser(user).post(`/users/${targetUser.id}/activation`);

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: admin users resend activation for active user',
        before : async ({ factory }) => {
            const targetUser = await factory.createActiveUser();
            const user = await factory.createActiveUser();

            return { user, targetUser };
        },
        test : async ({ t, adminAPI, user, targetUser }) => {
            const res = await adminAPI.asUser(user).post(`/users/${targetUser.id}/activation`);

            t.is(res.status, 0);
            t.is(res.error.code, 'USER_IS_NOT_PENDING');
        }
    }
];
