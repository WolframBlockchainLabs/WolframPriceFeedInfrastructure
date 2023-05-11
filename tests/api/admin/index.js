import sessions     from './sessions/index.js';
import actions      from './action/index.js';
import userSessions from './userSessions/index.js';
import profile      from './profile/index.js';
import users        from './users/index.js';
import roles        from './roles/index.js';
import news         from './news/index.js';
import seo          from './seo/index.js';

export default [
    ...sessions,
    ...userSessions,
    ...profile,
    ...users,
    ...roles,
    ...news,
    ...seo,
    ...actions
];
