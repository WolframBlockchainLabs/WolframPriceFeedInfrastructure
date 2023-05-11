export default [
    {
        label  : 'Positive: admin roles delete',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const role = await factory.createRole('admin');

            return { user, role };
        },
        test : async ({ t, adminAPI, user, role }) => {
            const res = await adminAPI.asUser(user).delete(`/roles/${role.id}`);

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: admin roles delete (role in use)',
        before : async ({ factory }) => {
            const role = await factory.createRole('admin');
            const currentUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser({
                roleId : role.id
            });

            return { currentUser, targetUser, role };
        },
        test : async ({ t, adminAPI, currentUser, role }) => {
            const res = await adminAPI.asUser(currentUser).delete(`/roles/${role.id}`);

            t.is(res.status, 0);
            t.is(res.error.code, 'ROLE_IN_USE');
        }
    }
];
