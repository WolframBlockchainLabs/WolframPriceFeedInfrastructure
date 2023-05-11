import twofactor from 'node-2fa';

export default [
    {
        label  : 'Positive: session confirm',
        before : async ({ factory }) => {
            const user = await factory.createUser();

            await user.activate('test-password');

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/sessions/confirm', { confirmToken: user.generateToken() });

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: session confirm by inactive user',
        before : async ({ factory }) => {
            const user = await factory.createUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/sessions/confirm', { confirmToken: user.generateToken() });

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_REQUIRED');
        }
    },
    {
        label  : 'Negative: session confirm with wrong token',
        before : async ({ factory }) => {
            const user = await factory.createUser();

            await user.activate('test-password');

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/sessions/confirm', { confirmToken: 'wrong' });

            t.is(res.status, 0);
            t.is(res.error.code, 'SECRET_WRONG');
        }
    },
    {
        label  : 'Negative: session is already confirmed',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const { token } = twofactor.generateToken(user.authSecret);

            const res = await adminAPI.asUser(user).post('/sessions/confirm', { confirmToken: token });

            t.is(res.status, 0);
            t.is(res.error.code, 'TOKEN_IS_ALREADY_CONFIRMED');
        }
    }
];
