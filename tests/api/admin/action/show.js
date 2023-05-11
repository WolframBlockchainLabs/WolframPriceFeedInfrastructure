import faker from 'faker';

export default [
    {
        label  : 'Positive: admin activation show',
        before : async ({ factory }) => {
            const user = await factory.createUser();
            const action = await factory.createActivateUserAction(user);

            return { action };
        },
        test : async ({ t, adminAPI, action }) => {
            const res = await adminAPI.get(`/actions/${action.id}`);

            t.is(res.status, 1);
        }
    },
    {
        label : 'Negative: admin activation show with not uuid id type',
        test  : async ({ t, adminAPI }) => {
            const res = await adminAPI.get('/actions/123');

            t.is(res.status, 0);
            t.is(res.error.fields.token, 'NOT_UUID');
        }
    },
    {
        label : 'Negative: admin activation show with wrong id',
        test  : async ({ t, adminAPI }) => {
            const randomUUID = faker.random.uuid();

            const res = await adminAPI.get(`/actions/${randomUUID}`);

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_NOT_FOUND');
            // t.is(res.error.fields.id, 'ACTION_NOT_FOUND');
        }
    },
    {
        label  : 'Negative: admin activation show with expired date (2 days)',
        before : async ({ factory }) => {
            const user = await factory.createUser();
            const action = await factory.createActivateUserAction(user, { createdAt: '01-01-1900' });

            return { action };
        },
        test : async ({ t, adminAPI, action }) => {
            const res = await adminAPI.get(`/actions/${action.id}`);

            t.is(res.status, 1);
            t.is(res.data.token, action.id);
        }
    }
];
