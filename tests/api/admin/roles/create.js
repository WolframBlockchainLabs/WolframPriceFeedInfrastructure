export default [
    {
        label  : 'Positive: admin roles create',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/roles', {
                name        : 'admino',
                permissions : [ 'USERS_READ' ]
            });

            t.is(res.status, 1);
            t.is(res.data.name, 'admino');
        }
    },
    {
        label  : 'Negative: admin roles create with empty permissions',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/roles', {
                name        : 'admino',
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
        label  : 'Negative: admin roles create with not uniq permissions',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).post('/roles', {
                name        : 'admino',
                permissions : [ 'USERS_READ', 'USERS_READ' ]
            });

            t.is(res.status, 0);
            t.is(res.error.fields.permissions, 'ITEMS_NOT_UNIQUE');
        }
    }
];
