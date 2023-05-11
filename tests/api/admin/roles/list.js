import Role from '../../../../lib/domain-model/Role.js';

const EXPECTED_ROLES_COUNT = 1;

export default [
    {
        label  : 'Positive: admin roles list',
        before : async ({ factory }) => {
            await factory.createRole('superadmin', { permissions: Role.PERMISSIONS });
            const user = await factory.createActiveUser();

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).get('/roles', { search: 'adm' });

            t.is(res.status, 1);
            t.is(res.data.length, EXPECTED_ROLES_COUNT);
            t.is(res.meta.totalCount, EXPECTED_ROLES_COUNT);
        }
    }
];
