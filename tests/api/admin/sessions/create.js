/* eslint-disable more/no-hardcoded-configuration-data */
// import cookie    from 'cookie';
// import signature from 'cookie-signature';
import Session   from './../../../../lib/domain-model/Session.js';

const PW = 'test-password';

export default [
    {
        label  : 'Positive: session create',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: PW });

            return { user };
        },
        test : async ({ t, adminAPI, user }) => {
            const res = await adminAPI.asAnonymous().post('/sessions', {
                password : PW,
                email    : user.email,
                secret   : user.generateToken()
            }, undefined, false);

            // const header = res.headers.get('set-cookie');
            const json = await res.json();
            // const sid = header ? cookie.parse(header)[config.sessions.name] : undefined;

            // t.truthy(header);
            // t.truthy(sid);

            // if (header) {
            //     t.is(cookie.parse(header).Path, '/');
            // }

            t.is(json.status, 1);

            const sessions = await Session.findAll();

            t.is(sessions.length, 1);
        }
    },
    {
        label  : 'Positive: session create with existing session',
        before : async ({ factory }) => {
            const user = await factory.createActiveUser({ password: PW });
            const targetUser = await factory.createActiveUser({ password: PW });
            const session = await factory.createUserSession(user.id);

            return { user, targetUser, session };
        },
        test : async ({ t, adminAPI, user, targetUser, session }) => {
            const res = await adminAPI.asUserSession({
                userId    : user.id,
                sessionId : session.sid
            }).post('/sessions', {
                password : PW,
                email    : targetUser.email,
                secret   : targetUser.generateToken()
            }, undefined, false);

            // const header = res.headers.get('set-cookie');
            const json = await res.json();
            // const raw = header ? cookie.parse(header)[config.sessions.name] : null;
            // const sid = header ? signature.unsign(raw.replace('s:', ''), config.sessions.secret) : null;

            // t.truthy(header);
            // t.truthy(sid);
            // t.is(sid !== session.sid, true);

            // const newSession = await Session.findOneOrFail({ where: { sid } });

            // t.is(newSession.userId, targetUser.id);

            // if (header) {
            //     t.is(cookie.parse(header).Path, '/');
            // }

            t.is(json.status, 1);

            const sessions = await Session.findAll({
                transaction : global.testTransaction
            });

            t.is(sessions.length, 1);
        }
    },
    {
        label  : 'Negative: session with wrong email',
        before : async ({ factory }) => {
            const user = await factory.createUser({ password: PW });

            return { user };
        },
        test : async ({ t, adminAPI }) => {
            const res = await adminAPI.asAnonymous().post('/sessions', {
                password : PW,
                email    : 'test@gmail.com'
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'AUTHENTICATION_FAILED');
        }
    },
    {
        label  : 'Negative: session with inactive user',
        before : async ({ factory }) => {
            const user = await factory.createUser({ password: PW, status: 'PENDING' });

            return { user };
        },
        test : async ({ t, adminAPI }) => {
            const res = await adminAPI.asAnonymous().post('/sessions', {
                password : PW,
                email    : 'test@gmail.com'
            });

            t.is(res.status, 0);
            t.is(res.error.code, 'AUTHENTICATION_FAILED');
        }
    }
];
