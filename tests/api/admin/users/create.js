/* eslint-disable more/no-hardcoded-password */
import User from './../../../../lib/domain-model/User.js';


/* eslint-disable more/no-hardcoded-configuration-data */
export default [
    {
        label  : 'Positive: admin users create',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('test-role');
            const user = await factory.createActiveUser();

            return { user, roleId };
        },
        test : async ({ t, adminAPI, user, roleId }) => {
            const res = await adminAPI.asUser(user).post('/users', {
                email       : 'test@gmail.com',
                firstName   : 'Name',
                lastName    : 'Surname',
                middleName  : 'Test',
                phoneNumber : '380735456755',
                roleId
            });

            t.is(res.status, 1);

            const newUser = await User.findOne({ where: { id: res.data.id } });

            t.is(newUser.authEnabled, true);
            t.is(newUser.authConfirmed, false);
            t.truthy(newUser.authQr);
            t.truthy(newUser.authSecret);
            t.truthy(newUser.authSecretLink);
        }
    },
    {
        label  : 'Negative: admin users create without permissions',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('admin', { permissions: [] });

            const user = await factory.createActiveUser({ roleId });

            return { user, roleId };
        },
        test : async ({ t, adminAPI, user, roleId }) => {
            const res = await adminAPI.asUser(user).post('/users', {
                email     : 'test@gmail.com',
                firstName : 'Name',
                lastName  : 'Surname',
                roleId
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_FORBIDDEN');
        }
    },
    {
        label  : 'Negative: admin users create by inactive user',
        before : async ({ factory }) => {
            const { id: roleId } = await factory.createRole('admin', { permissions: [] });

            const user = await factory.createUser({ status: User.STATUS_BLOCKED });

            return { user, roleId };
        },
        test : async ({ t, adminAPI, user, roleId }) => {
            const res = await adminAPI.asUser(user).post('/users', {
                email     : 'test@gmail.com',
                firstName : 'Name',
                lastName  : 'Surname',
                roleId
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'SESSION_REQUIRED');
        }
    }
];
