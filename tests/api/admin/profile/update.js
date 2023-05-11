/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
import { rmdir } from 'fs/promises';
import faker     from 'faker';

const PW = 'Fake1Password';

export default [
    {
        label  : 'Positive: profile update',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: 'test-password' });

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const firstName = faker.name.firstName();
            const middleName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const email = faker.internet.email();
            const phoneNumber = '380931234567';

            const res = await adminAPI.asUser(user).patch('/profile', {
                firstName,
                middleName,
                lastName,
                email,
                phoneNumber,
                password        : PW,
                confirmPassword : PW
            });

            t.is(res.status, 1);
            t.truthy(res.data);
            t.is(res.data.firstName, firstName);
            t.is(res.data.middleName, middleName);
            t.is(res.data.lastName, lastName);
            t.is(res.data.email, email.toLowerCase());
            t.is(res.data.phoneNumber, phoneNumber);
        },
        after : async () => {
            await rmdir('storage/avatars', { recursive: true });
        }
    },
    {
        label  : 'Negative: profile update with wrong phone',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: 'test-password' });

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asUser(user).patch('/profile', {
                phoneNumber : '+3812312312'
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'FORMAT_ERROR');
            t.is(res.error.fields['data/phoneNumber'], 'WRONG_PHONE_FORMAT');
        },
        after : async () => {
            await rmdir('storage/avatars', { recursive: true });
        }
    }
];
