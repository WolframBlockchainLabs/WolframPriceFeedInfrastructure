/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
export default [
    {
        label  : 'Positive: admin users update',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser();
            const { id: roleId } = await factory.createRole('test');

            return { contextUser, targetUser, roleId };
        },
        test : async ({ t, adminAPI, contextUser, targetUser, roleId }) => {
            const res = await adminAPI.asUser(contextUser).patch(`/users/${targetUser.id}`, {
                email           : 'test@gmail.com',
                firstName       : 'Name',
                lastName        : 'Surname',
                password        : 'testPw1',
                confirmPassword : 'testPw1',
                roleId
            });

            await targetUser.reload();

            targetUser.authenticate('testPw1', targetUser.generateToken());

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Positive: admin users update, activate',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser, targetUser }) => {
            const res = await adminAPI.asUser(contextUser).patch(`/users/${targetUser.id}`, {
                status : 'ACTIVE'
            });

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Positive: admin users update, block',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser, targetUser }) => {
            const res = await adminAPI.asUser(contextUser).patch(`/users/${targetUser.id}`, {
                status : 'BLOCKED'
            });

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: admin users update without permissions',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('test', { permissions: [] });
            const contextUser = await factory.createActiveUser({ roleId });
            const targetUser = await factory.createActiveUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser, targetUser }) => {
            const res = await adminAPI.asUser(contextUser).patch(`/users/${targetUser.id}`, {
                email     : 'test@gmail.com',
                firstName : 'Name',
                lastName  : 'Surname'
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_FORBIDDEN');
        }
    }
];
