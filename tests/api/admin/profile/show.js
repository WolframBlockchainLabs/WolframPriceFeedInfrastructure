/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
export default [
    {
        label  : 'Positive: profile show',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: 'test-password' });

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).get('/profile');

            t.is(res.status, 1);
            t.truthy(res.data);
        }
    },
    {
        label : 'Negative: profile show without session',
        test  : async ({ t, adminAPI }) => {
            const res = await adminAPI.get('/profile');

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_REQUIRED');
        }
    }
];
