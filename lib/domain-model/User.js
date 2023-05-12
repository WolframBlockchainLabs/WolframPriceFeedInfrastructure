import crypto                      from 'crypto';
import twofactor                   from 'node-2fa';
import pickBy                      from 'lodash/pickBy.js';
import Base                        from './Base.js';
import { throwError, ERROR_CODES } from './../utils/error.js';
import { DataTypes as DT, Op }     from './../../packages.js';
import { storeImage, removeImage } from './../infrastructure/images.js';
import config                      from './../config.cjs';
import StoredTriggerableAction     from './StoredTriggerableAction.js';

const {
    EMAIL_NOT_UNIQUE,
    TWO_FACTOR_IS_NOT_ENABLED,
    TOKEN_IS_ALREADY_CONFIRMED,
    SECRET_WRONG,
    SECRET_REQUIRED,
    AUTHENTICATION_FAILED
} = ERROR_CODES;

const SALT_LENGTH = 16;
const KEY_LENGTH  = 64;

class User extends Base {
    static STATUS_ACTIVE  = 'ACTIVE';

    static STATUS_BLOCKED = 'BLOCKED';

    static STATUS_PENDING = 'PENDING';

    static STATUSES = [
        'ACTIVE',
        'BLOCKED',
        'PENDING'
    ];

    static options = {
        scopes : {
            active() {
                return {
                    where : { status: User.STATUS_ACTIVE }
                };
            },
            filter : (fields = {}) => {
                const where = { ...fields };

                for (const field in fields) {
                    if (where[field] === null || where[field] === undefined) {
                        delete where[field];
                    }
                }

                return { where };
            },
            search(searchString) {
                const searchFields = [ 'firstName', 'lastName', 'middleName', 'email', 'phoneNumber' ];

                if (searchString) {
                    return {
                        where : { [Op.or]: searchFields.map(field => ({ [field]: { [Op.like]: `%${ searchString }%` } })) }
                    };
                }

                return { where: {} };
            },
            sort({ sortBy, orderBy }) {
                if (sortBy === 'role') {
                    return { order: [ [ 'role', 'name', orderBy ], [ 'lastName', orderBy ], [ 'firstName', orderBy ] ] };
                }

                return { order: [ [ sortBy, orderBy ] ] };
            },
            idOrder(id) {
                return {
                    where : { id },
                    order : id && id.length ? [ Base.customFieldOrder('User.id', id) ] : []
                };
            }
        }
    }

    static schema = {
        id             : { type: DT.BIGINT,              primaryKey: true, autoIncrement: true },
        roleId         : { type: DT.BIGINT,              allowNull: false },
        email          : { type: DT.STRING,              allowNull: false, unique: true },
        status         : { type: DT.ENUM(this.STATUSES), allowNull: false, defaultValue: this.STATUS_PENDING },
        phoneNumber    : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        firstName      : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        middleName     : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        lastName       : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        avatar         : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        passwordHash   : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        salt           : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        authSecret     : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        authSecretLink : { type: DT.STRING,              allowNull: false, defaultValue: '' },
        authConfirmed  : { type: DT.BOOLEAN,             allowNull: false, defaultValue: false },
        authEnabled    : {
            type         : DT.BOOLEAN,
            allowNull    : false,
            defaultValue : false,
            set(value) {
                const newValue = Boolean(value);
                const oldValue = this.getDataValue('authEnabled');

                if (newValue !== oldValue) {
                    const { secret, qr } = twofactor.generateSecret({
                        name    : config.projectName || config.packageName,
                        account : this.email
                    });

                    this.setDataValue('authEnabled', value);
                    this.setDataValue('authConfirmed', false);
                    this.setDataValue('authSecret', newValue ? secret : '');
                    this.setDataValue('authSecretLink', newValue ? qr : '');
                }
            }
        },
        authQr : {
            type : DT.VIRTUAL,
            get() {
                const authConfirmed = this.getDataValue('authConfirmed');

                if (authConfirmed) {
                    return null;
                }

                return this.getDataValue('authSecretLink');
            }
        },
        password : {
            type : DT.VIRTUAL,
            set(password) {
                const salt = this._generateSalt();
                const passwordHash = this._hashPassword(password, salt);

                this.setDataValue('salt', salt);
                this.setDataValue('passwordHash', passwordHash);
            }
        },
        createdAt : { type: DT.DATE, allowNull: false },
        updatedAt : { type: DT.DATE, allowNull: false }
    };


    static async register(data, files = {}, options = {}) {
        const modelFields = Object.keys(User.schema);

        const [ user, created ] = await User.findOrCreate({
            where    : { email: data.email },
            defaults : {
                status      : this.constructor.STATUS_PENDING,
                authEnabled : true,
                ...pickBy(data, (value, key) => modelFields.includes(key))
            },
            ...options
        });

        if (!created) {
            throwError(EMAIL_NOT_UNIQUE);
        }

        if (files && files.avatar) {
            await user._setAvatar(files.avatar, options);
        }

        return user;
    }

    async confirmAuth(token) {
        if (!this.authEnabled) {
            throwError(TWO_FACTOR_IS_NOT_ENABLED);
        }

        if (this.authConfirmed) {
            throwError(TOKEN_IS_ALREADY_CONFIRMED);
        }

        const result = twofactor.verifyToken(this.authSecret, token);

        if (!result || result.delta !== 0) {
            throwError(SECRET_WRONG, { confirmToken: 'SECRET_WRONG' });
        }

        await this.update({
            authConfirmed : true,
            status        : this.constructor.STATUS_ACTIVE
        });
    }

    async updateProfile(data, files = {}) {
        const { status, ...newData } = data;

        if (status) {
            if (this.status === 'BLOCKED' && this.status !== status && !this.passwordHash) {
                await this.update({ status: 'PENDING' });
            } else {
                await this.update({ status });
            }
        }

        if (data.email) {
            const userWithNewEmail = await User.findOne({
                where : {
                    email : data.email,
                    id    : { [Op.ne]: this.id }
                }
            });

            if (userWithNewEmail) {
                throwError(EMAIL_NOT_UNIQUE);
            }

            if (this.isPending()) {
                await StoredTriggerableAction.destroy({
                    where : {
                        exclusiveUserId : this.id
                    }
                });
            }
        }

        await this.update({ updatedBy: this.id, ...newData });

        if (files.avatar) {
            await this._setAvatar(files.avatar);
        }
    }

    authenticate(password, secret) {
        if (!this._checkPassword(password)) {
            throwError(AUTHENTICATION_FAILED);
        }

        if (this.isTwoStepAuthEnabled() && !secret) {
            throwError(SECRET_REQUIRED);
        }

        if (this.isTwoStepAuthEnabled() && secret) {
            const result = twofactor.verifyToken(this.authSecret, secret);

            if (!result || result.delta !== 0) {
                throwError(SECRET_WRONG, { secret: 'SECRET_WRONG' });
            }
        }
    }

    activate(password) {
        return this.update({
            password,
            status : User.STATUS_ACTIVE
        });
    }

    async getPermissions() {
        const { permissions } = await this.role;

        return permissions;
    }

    isPending() {
        return this.id && this.status === User.STATUS_PENDING;
    }

    isBlocked() {
        return this.id && this.status === User.STATUS_BLOCKED;
    }

    isTwoStepAuthEnabled() {
        return this.authSecret && this.authConfirmed && this.authEnabled;
    }

    _checkPassword(plain) {
        if (!this.id) {
            return false;
        }

        const hash = this._hashPassword(plain, this.salt);

        return hash === this.passwordHash;
    }

    _generateSalt() {
        const salt = crypto.randomBytes(SALT_LENGTH);

        return salt.toString('hex');
    }

    _hashPassword(password, salt) {
        const hash = crypto.scryptSync(password, salt, KEY_LENGTH); // eslint-disable-line no-sync

        return hash.toString('hex');
    }

    generateToken() {
        if (this.authSecret) {
            const { token } = twofactor.generateToken(this.authSecret);

            return token;
        }

        return null;
    }

    async _setAvatar(file, options = {}) {
        const avatar = await storeImage(this.id, file, config.images.avatar);

        try {
            await this.update({ avatar }, options);
        } catch (e) {
            await removeImage(avatar, config.images.avatar);

            throw e;
        }

        return this.avatar;
    }

    static profileInclude() {
        return  [
            { association: 'role', required: false }
        ];
    }

    static filterInclude({ sortBy }) {
        return  [
            ...(sortBy === 'role' ? [ { association: 'role', required: false, attributes: [] } ] : [])
        ];
    }
}

export default User;
