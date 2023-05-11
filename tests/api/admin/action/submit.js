import moment from 'moment';

const fakePw = 'Fake1Fake';
const EXPIRE_DAYS = 2;

export default [
    {
        label  : 'Positive: admin activation submit (1d 23h 59m)',
        before : async ({ factory }) => {
            const user = await factory.createUser();
            // const expiredDate = moment().subtract(EXPIRE_DAYS, 'days').add(1, 'minute');
            const expiredDate = moment().subtract(1, 'hours').add(1, 'minute');
            const action = await factory.createActivateUserAction(user, {
                createdAt : expiredDate
            });

            return { action };
        },
        test : async ({ t, adminAPI, action }) => {
            const res = await adminAPI.asAnonymous().post(`/actions/${action.id}`, {
                data : {
                    password        : fakePw,
                    confirmPassword : fakePw
                }
            });

            t.is(res.status, 1);
        }
    },
    {
        label  : 'Negative: admin activation submit expired (2d 1m)',
        before : async ({ factory }) => {
            const user = await factory.createUser();
            const expiredDate = moment().subtract(EXPIRE_DAYS, 'days').subtract(1, 'minute');
            const action = await factory.createActivateUserAction(user, {
                createdAt : expiredDate
            });

            return { action };
        },
        test : async ({ t, adminAPI, action }) => {
            const res = await adminAPI.asAnonymous().post(`/actions/${action.id}`, {
                data : {
                    password        : fakePw,
                    confirmPassword : fakePw
                }
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'ACTION_EXPIRED');
        }
    },
    {
        label  : 'Negative: admin activation submit - user is not pending',
        before : async ({ factory }) => {
            const user = await factory.createUser();
            const action = await factory.createActivateUserAction(user);

            await user.activate();

            return { action };
        },
        test : async ({ t, adminAPI, action }) => {
            const res = await adminAPI.asAnonymous().post(`/actions/${action.id}`, {
                data : {
                    password        : fakePw,
                    confirmPassword : fakePw
                }
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'USER_IS_NOT_PENDING');
        }
    }
];
