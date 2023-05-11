import express     from 'express';
import csrf        from 'csurf';
import controllers from './controllers/index.js';
import middlewares from './../middlewares.js';

const csrfProtection = csrf({});

const router = express.Router();
const { fileUpload, detectDevice, detectIp, sequelizeSession, errorHandler } = middlewares;
const { check } = controllers.sessions;

export default function init({ sequelize }) {
    router.use(sequelizeSession({ sequelize }));
    router.use(fileUpload().any());
    router.use(csrfProtection);

    router.post('/actions/:token', controllers.actions.submit);
    router.get('/actions/:token',  controllers.actions.show);

    router.post('/session_actions/:token', detectIp, detectDevice, controllers.actions.submitAndLogin);

    router.post('/sessions', detectIp, detectDevice, controllers.sessions.create);
    router.get('/sessions/csrf',                     controllers.sessions.csrf);
    router.post('/sessions/confirm',          check, controllers.sessions.confirm);
    router.get('/sessions',                   check, controllers.sessions.list);
    router.delete('/sessions/:sessionId',     check, controllers.sessions.delete);
    router.delete('/sessions',                check, controllers.sessions.deleteCurrent);

    router.patch('/profile',              check, controllers.profile.update);
    router.get('/profile',                check, controllers.profile.show);

    router.get('/users',                  check,  controllers.users.list);
    router.get('/users/:id',              check,  controllers.users.show);
    router.post('/users',                 check,  controllers.users.create);
    router.patch('/users/:id',            check,  controllers.users.update);
    router.post('/users/:id/activation',  check,  controllers.users.sendActivation);

    router.get('/users/:userId/sessions',               check,  controllers.userSessions.list);
    router.delete('/users/:userId/sessions',            check,  controllers.userSessions.deleteAll);
    router.delete('/users/:userId/sessions/:sessionId', check,  controllers.userSessions.delete);

    router.get('/roles',        check, controllers.roles.list);
    router.get('/roles/:id',    check, controllers.roles.show);
    router.post('/roles',       check, controllers.roles.create);
    router.patch('/roles/:id',  check, controllers.roles.update);
    router.delete('/roles/:id', check, controllers.roles.delete);

    router.get('/news',         check, controllers.news.list);
    router.get('/news/:id',     check, controllers.news.show);
    router.post('/news',        check, controllers.news.create);
    router.patch('/news/:id',   check, controllers.news.update);
    router.delete('/news/:id',  check, controllers.news.delete);

    router.get('/seo',          check, controllers.seo.list);
    router.get('/seo/:id',      check, controllers.seo.show);
    router.post('/seo',         check, controllers.seo.create);
    router.patch('/seo/:id',    check, controllers.seo.update);
    router.delete('/seo/:id',   check, controllers.seo.delete);

    router.use(errorHandler);

    router.post('/user/reset-password', controllers.users.resetPassword);

    return router;
}
