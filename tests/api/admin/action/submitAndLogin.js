import moment from 'moment';

const fakePw = 'Fake1Fake';

export default [
    {
        label  : 'Positive: admin activation submit and login (1d 23h 59m)',
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
            const res = await adminAPI.asAnonymous().post(`/session_actions/${action.id}`, {
                data : {
                    password        : fakePw,
                    confirmPassword : fakePw
                }
            });

            t.is(res.status, 1);
        }
    }
];
