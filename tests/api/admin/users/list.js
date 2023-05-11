const USERS_IN_DB = 2;

export default [
    {
        label  : 'Positive: admin users list',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser }) => {
            const res = await adminAPI.asUser(contextUser).get('/users');

            t.is(res.status, 1);
            t.is(res.data.length, USERS_IN_DB);
            t.is(res.meta.totalCount, USERS_IN_DB);
        }
    },
    {
        label  : 'Positive: admin users list sort by role',
        before : async ({ factory }) => {
            const contextUser = await factory.createActiveUser();
            const targetUser = await factory.createActiveUser();

            return { contextUser, targetUser };
        },
        test : async ({ t, adminAPI, contextUser, targetUser }) => {
            const res = await adminAPI.asUser(contextUser).get('/users', {
                sortBy : 'role',
                search : targetUser.firstName
            });

            t.is(res.status, 1);
            t.is(res.data.length, 1);
            t.is(res.meta.totalCount, 1);
        }
    }
];
