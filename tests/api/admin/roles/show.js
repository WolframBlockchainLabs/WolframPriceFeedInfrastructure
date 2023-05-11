import Role from '../../../../lib/domain-model/Role.js';

export default [
    {
        label  : 'Positive: admin roles show',
        before : async ({ factory }) => {
            const { name: roleName, id: roleId } = await factory.createRole('superadmin', { permissions: Role.PERMISSIONS });
            const user = await factory.createActiveUser({ roleId });

            return { user, roleName };
        },
        test : async ({ t, adminAPI, user, roleName }) => {
            await user.load('profile');

            const res = await adminAPI.asUser(user).get(`/roles/${user.role.id}`);

            t.is(res.status, 1);
            t.is(res.data.name, roleName);
        }
    }
];
