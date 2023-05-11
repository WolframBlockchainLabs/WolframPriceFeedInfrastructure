/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-commonjs
module.exports = {
    up : async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Roles', {
            id          : { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            name        : { type: Sequelize.STRING, allowNull: false, unique: true },
            description : { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            permissions : { type: Sequelize.JSON,   allowNull: false },
            createdAt   : { type: Sequelize.DATE,   allowNull: false },
            updatedAt   : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('Users', {
            id             : { type: Sequelize.BIGINT,  primaryKey: true, autoIncrement: true },
            roleId         : { type: Sequelize.BIGINT,  allowNull: false, references: { model: 'Roles', key: 'id' } },
            email          : { type: Sequelize.STRING,  allowNull: false, unique: true },
            status         : { type: Sequelize.STRING,  allowNull: false, defaultValue: 'PENDING' },
            phoneNumber    : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            firstName      : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            middleName     : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            lastName       : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            avatar         : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            passwordHash   : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            salt           : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            authSecret     : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            authSecretLink : { type: Sequelize.STRING,  allowNull: false, defaultValue: '' },
            authEnabled    : { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            authConfirmed  : { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt      : { type: Sequelize.DATE,    allowNull: false },
            updatedAt      : { type: Sequelize.DATE,    allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('News', {
            id          : { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            slug        : { type: Sequelize.STRING, allowNull: false, unique: true },
            title       : { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            previewImg  : { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            category    : { type: Sequelize.STRING, allowNull: false, defaultValue: 'ARTICLES' },
            status      : { type: Sequelize.STRING, allowNull: false, defaultValue: 'DRAFT' },
            publishedAt : { type: Sequelize.DATE,   allowNull: true },
            publishTill : { type: Sequelize.DATE,   allowNull: true },
            deletedAt   : { type: Sequelize.DATE,   allowNull: true },
            createdAt   : { type: Sequelize.DATE,   allowNull: false },
            updatedAt   : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('NewsTranslations', {
            id              : { type: Sequelize.BIGINT,         primaryKey: true, autoIncrement: true },
            newsId          : { type: Sequelize.BIGINT,         allowNull: false, references: { model: 'News', key: 'id' } },
            lang            : { type: Sequelize.STRING,         allowNull: false, defaultValue: 'ua' },
            title           : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            previewContent  : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            metaTitle       : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            metaKeywords    : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            metaDescription : { type: Sequelize.TEXT('medium'), allowNull: false },
            content         : { type: Sequelize.TEXT('medium'), allowNull: false },
            seoContent      : { type: Sequelize.TEXT('medium'), allowNull: false },
            createdAt       : { type: Sequelize.DATE,           allowNull: false },
            updatedAt       : { type: Sequelize.DATE,           allowNull: false },
            deletedAt       : { type: Sequelize.DATE,           allowNull: true }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('Seo', {
            id        : { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            name      : { type: Sequelize.STRING, allowNull: false,  defaultValue: '' },
            index     : { type: Sequelize.STRING, allowNull: false,  defaultValue: 'default' },
            follow    : { type: Sequelize.STRING, allowNull: false,  defaultValue: 'default' },
            createdAt : { type: Sequelize.DATE,   allowNull: false },
            updatedAt : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('SeoTranslations', {
            id          : { type: Sequelize.BIGINT,         primaryKey: true, autoIncrement: true },
            seoId       : { type: Sequelize.BIGINT,         allowNull: false, references: { model: 'Seo', key: 'id' } },
            url         : { type: Sequelize.STRING,         allowNull: false, unique: true },
            lang        : { type: Sequelize.STRING,         allowNull: false, defaultValue: 'ua' },
            header      : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            description : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            keywords    : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            title       : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            canonical   : { type: Sequelize.STRING,         allowNull: false, defaultValue: '' },
            text        : { type: Sequelize.TEXT('medium'), allowNull: false },
            createdAt   : { type: Sequelize.DATE,           allowNull: false },
            updatedAt   : { type: Sequelize.DATE,           allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('StoredTriggerableActions', {
            id              : { type: Sequelize.UUID,   defaultValue: Sequelize.UUIDV4, primaryKey: true },
            type            : { type: Sequelize.STRING, allowNull: false },
            exclusiveUserId : { type: Sequelize.BIGINT, allowNull: true, references: { model: 'Users', key: 'id' }  },
            payload         : { type: Sequelize.JSON,   allowNull: false },
            createdAt       : { type: Sequelize.DATE,   allowNull: false },
            updatedAt       : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('Sessions', {
            // default connect-session-sequelize Session definition
            sid       : { type: Sequelize.STRING, primaryKey: true },
            expires   : { type: Sequelize.DATE },
            data      : { type: Sequelize.TEXT },
            // custome connect-session-sequelize Session definition
            userId    : { type: Sequelize.BIGINT, allowNull: true, references: { model: 'Users', key: 'id' } },
            createdAt : { type: Sequelize.DATE,   allowNull: false },
            updatedAt : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });

        await queryInterface.createTable('Translations', {
            id        : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            entityId  : { type: Sequelize.INTEGER, allowNull: false },
            entity    : { type: Sequelize.STRING, allowNull: false },
            field     : { type: Sequelize.STRING, allowNull: false },
            lang      : { type: Sequelize.STRING, allowNull: false },
            value     : { type: Sequelize.TEXT('medium'), allowNull: false },
            createdAt : { type: Sequelize.DATE, allowNull: false },
            updatedAt : { type: Sequelize.DATE, allowNull: false },
            deletedAt : { type: Sequelize.DATE, allowNull: true }
        }, { charset: 'utf8mb4' });

        await queryInterface.addIndex('Translations', [ 'entityId', 'entity', 'lang', 'field' ], {
            type : 'UNIQUE',
            name : 'translation_unique_indx'
        });
    },

    down : async (queryInterface) => {
        await queryInterface.dropTable('Sessions');
        await queryInterface.dropTable('StoredTriggerableActions');
        await queryInterface.dropTable('SeoTranslations');
        await queryInterface.dropTable('Seo');
        await queryInterface.dropTable('NewsTranslations');
        await queryInterface.dropTable('News');
        await queryInterface.dropTable('Users');
        await queryInterface.dropTable('Roles');
        await queryInterface.dropTable('Translations');
    }
};
