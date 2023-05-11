/* eslint-disable  more/no-hardcoded-configuration-data */
import { readFile }             from 'fs/promises';
import moment                   from 'moment';
import faker                    from 'faker';
import nodemailerMock           from 'nodemailer-mock';
import twofactor                from 'node-2fa';
import Tokens                   from 'csrf';
import Translation              from './../lib/domain-model/Translation.js';
import Seo                      from './../lib/domain-model/Seo.js';
import User                     from './../lib/domain-model/User.js';
import Role                     from './../lib/domain-model/Role.js';
import News                     from './../lib/domain-model/News.js';
import Action, { ACTION_TYPES } from './../lib/domain-model/StoredTriggerableAction.js';
import NewsTranslation          from './../lib/domain-model/NewsTranslation.js';
import SeoTranslation           from './../lib/domain-model/SeoTranslation.js';
import Session                  from './../lib/domain-model/Session.js';

export default class TestFactory {
    csrfSecret = 'KJvdqEgzJiC20drl9M_qn2mZ';

    async createUser(data = {}) {
        const { id: roleId } = await this.createRole('test-role', { permissions: Role.PERMISSIONS });
        const rolesCount = await Role.count({ transaction: global.testTransaction });

        if (!rolesCount) {
            await Role.bulkCreate(Role.DEFAULT_ROLES, { transaction: global.testTransaction });
        }

        return User.register({
            email      : faker.internet.email(),
            firstName  : faker.name.firstName(),
            secondName : faker.name.lastName(),
            avatar     : faker.image.imageUrl(),
            password   : faker.internet.password(),
            roleId,
            ...data
        }, null, { transaction: global.testTransaction });
    }

    async createActiveUser(data = {}) {
        const user = await this.createUser(data);

        const { token } = twofactor.generateToken(user.authSecret);

        await user.confirmAuth(token);

        return user;
    }

    async createRole(name, params = {}) {
        const { permissions } = params;

        const [ role ] = await Role.findOrCreate({
            where    : { name },
            defaults : {
                name,
                permissions : permissions || [
                    'USERS_READ',
                    'USERS_WRITE'
                ]
            },
            transaction : global.testTransaction
        });

        return role;
    }

    async getRole(name) {
        const role = await Role.findOne({ where: { name } });

        return role;
    }

    async createNews(data = {}, files = null) {
        const defaultFiles  = {
            previewImg : {
                originalname : 'image.png',
                mimetype     : 'image/png',
                buffer       : await readFile(new URL('./factory/news.png', import.meta.url))
            }
        };

        const news = await News.createInstance({
            status       : News.STATUS_DRAFT,
            category     : News.CATEGORY_NEWS,
            translations : {
                'ru' : {
                    lang            : 'ru',
                    title           : faker.lorem.sentence(),
                    previewContent  : faker.lorem.sentence(),
                    content         : faker.lorem.text(),
                    seoContent      : faker.lorem.text(),
                    metaTitle       : faker.lorem.sentence(),
                    metaKeywords    : faker.lorem.sentence(),
                    metaDescription : faker.lorem.sentence()
                },
                'ua' : {
                    lang            : 'ua',
                    title           : faker.lorem.sentence(),
                    previewContent  : faker.lorem.sentence(),
                    content         : faker.lorem.text(),
                    seoContent      : faker.lorem.text(),
                    metaTitle       : faker.lorem.sentence(),
                    metaKeywords    : faker.lorem.sentence(),
                    metaDescription : faker.lorem.sentence()
                }
            },
            ...data
        }, files || defaultFiles);

        return news;
    }

    async createSeoItem(data = {}) {
        const item = await Seo.createInstance({
            name         : faker.random.words(),
            index        : faker.random.words(),
            follow       : 'nofollow',
            translations : {
                'ru' : {
                    lang : 'ru',
                    url  : faker.lorem.sentence()
                },
                'ua' : {
                    lang : 'ua',
                    url  : faker.lorem.sentence()
                }
            },
            ...data
        });

        await item.load('details');

        return item;
    }


    createActivateUserAction(user, options = {}) {
        return Action.create({
            type    : ACTION_TYPES.ACTIVATE_USER,
            payload : { userId: user.id },
            ...options
        }, { transaction: global.testTransaction });
    }

    createResetPasswordAction(user) {
        return Action.create({
            type    : ACTION_TYPES.RESET_USER_PASSWORD,
            payload : { userId: user.id }
        }, { transaction: global.testTransaction });
    }

    createAnonymousSession() {
        return Session.create({
            sid     : faker.random.uuid(),
            expires : moment().add(1, 'days'),
            data    : `{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"},"csrfSecret":"${this.csrfSecret}"}`
        });
    }

    createUserSession(userId) {
        return Session.create({
            userId,
            sid     : faker.random.uuid(),
            expires : moment().add(1, 'days'),
            data    : `{"cookie":{"originalMaxAge":null,"expires":null,"secure":false,"httpOnly":true,"path":"/"},"csrfSecret":"${this.csrfSecret}","context":{"userId":${userId},"useragent":{"ip":"::ffff:127.0.0.1","browser":"node-fetch","version":"1.0","os":"unknown","platform":"unknown"}}}`
        });
    }

    csrfToken() {
        const tokens = new Tokens();

        return tokens.create(this.csrfSecret);
    }

    async cleanup() {
        nodemailerMock.mock.reset();

        await SeoTranslation.truncate();
        await NewsTranslation.truncate();
        await Session.truncate();
        await Action.destroy({ where: {} });
        await News.destroy({ where: {} });
        await Seo.destroy({ where: {} });
        await User.destroy({ where: {} });
        await Role.destroy({ where: {} });
        await Translation.truncate();
    }
}
