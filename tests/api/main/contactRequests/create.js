export default [
    {
        label : 'Positive: contact request create',
        test  : async ({ t, userAPI }) => {
            const res = await userAPI.post('/contactRequests', {
                name        : 'User name',
                phone       : '+380761234567',
                description : 'Test description'
            });

            t.is(res.status, 1);
        }
    }
];
