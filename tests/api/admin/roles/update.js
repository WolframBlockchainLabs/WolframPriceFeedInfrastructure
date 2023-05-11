export default [
    {
        label  : 'Positive: admin roles update',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const role = await factory.createRole('admin');

            return { user, role };
        },
        test : async ({ t, adminAPI, user, role }) => {
            const res = await adminAPI.asUser(user).patch(`/roles/${role.id}`, {
                name        : 'admins',
                permissions : [ 'USERS_READ' ]
            });

            t.is(res.status, 1);
            t.is(res.data.name, 'admins');
        }
    },
    {
        label  : 'Negative: admin roles update with empty permissions',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const role = await factory.createRole('admin');

            return { user, role };
        },
        test : async ({ t, adminAPI, user, role }) => {
            const res = await adminAPI.asUser(user).patch(`/roles/${role.id}`, {
                name        : 'admins',
                permissions : [ null, '', [], undefined ]
            });

            t.is(res.status, 0);
            t.is(res.error.fields['permissions/0'], 'CANNOT_BE_NULL');
            t.is(res.error.fields['permissions/1'], 'CANNOT_BE_EMPTY');
            t.is(res.error.fields['permissions/2'], 'FORMAT_ERROR');
            t.is(res.error.fields['permissions/3'], 'CANNOT_BE_NULL');
        }
    },
    {
        label  : 'Negative: admin roles update with not uniq permissions',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();
            const role = await factory.createRole('admin');

            return { user, role };
        },
        test : async ({ t, adminAPI, user, role }) => {
            const res = await adminAPI.asUser(user).patch(`/roles/${role.id}`, {
                name        : 'admins',
                permissions : [ 'USERS_READ', 'USERS_READ' ]
            });

            t.is(res.status, 0);
            t.is(res.error.fields.permissions, 'ITEMS_NOT_UNIQUE');
        }
    }
];
