/* eslint-disable more/no-hardcoded-password */
import moment                      from 'moment';
import Base                        from './Base.js';
import User                        from './User.js';
import { DataTypes as DT }         from './../../packages.js';
import { throwError, ERROR_CODES } from './../utils/error.js';
import config                      from './../config.cjs';

const {
    ACTION_EXPIRED,
    USER_IS_NOT_PENDING,
    PENDING_USER_RESET_PASSWORD
} = ERROR_CODES;

export const ACTION_TYPES = {
    'ACTIVATE_USER'  : 'ACTIVATE_USER',
    'RESET_PASSWORD' : 'RESET_PASSWORD'
};

const {
    actions : {
        ACTIVATION_MEASUREMENT,
        ACTIVATION_TIMEOUT
    }
} = config;

const ACTIONS_BY_TYPE = {
    [ACTION_TYPES.ACTIVATE_USER] : {
        async validatePayload(payload) {
            const user = await User.findOneOrFail({ where: { id: payload.userId } });

            if (!user.isPending()) {
                throwError(USER_IS_NOT_PENDING);
            }
        },
        async run({ password }, { payload }) {
            const user = await User.findOneOrFail({ where: { id: payload.userId } });

            if (!user.isPending()) {
                throwError(USER_IS_NOT_PENDING);
            }

            return user.activate(password);
        }
    },
    [ACTION_TYPES.RESET_PASSWORD] : {
        async validatePayload(payload) {
            await User.findOneOrFail({ where: { email: payload.email } });
        },
        async run({ password }, { payload }) {
            const user = await User.findOneOrFail({ where: { email: payload.email } });

            if (user.isPending()) {
                // can't reset if not activated
                throwError(PENDING_USER_RESET_PASSWORD);
            }

            return user.update({
                password
            });
        }
    }
};

class StoredTriggerableAction extends Base {
    static options = {
        name : {
            singular : 'action',
            plural   : 'actions'
        }
    }

    static schema = {
        id              : { type: DT.UUID, defaultValue: DT.UUIDV4, primaryKey: true },
        type            : { type: DT.ENUM(Object.values(ACTION_TYPES)), allowNull: false },
        exclusiveUserId : { type: DT.BIGINT, allowNull: true },
        payload         : { type: DT.JSON,   allowNull: false, defaultValue: {} },
        createdAt       : { type: DT.DATE,   allowNull: false },
        updatedAt       : { type: DT.DATE,   allowNull: false },
        isExpired       : {
            type : DT.VIRTUAL,
            get() {
                const now = moment();

                return now.diff(moment(this.createdAt), ACTIVATION_MEASUREMENT) >= ACTIVATION_TIMEOUT;
            }
        }
    };

    static initRelations() {
        this.belongsTo(User, { foreignKey: 'exclusiveUserId', targetKey: 'id', as: 'exclusiveUser' });
    }

    async save(...args) {
        await this.#validatePayloadByType(this.type, this.payload);

        if (this.exclusiveUserId) {
            await StoredTriggerableAction.destroy({
                where : {
                    type            : this.type,
                    exclusiveUserId : this.exclusiveUserId
                }
            });
        }

        return super.save(...args);
    }

    #validatePayloadByType = async (type, payload) => {
        const actionLogic = ACTIONS_BY_TYPE[type];

        await actionLogic.validatePayload(payload);
    }

    run(params) {
        const actionLogic = ACTIONS_BY_TYPE[this.type];

        return actionLogic.run(params, this);
    }

    async runAndDelete(params) {
        if (this.isExpired) {
            throwError(ACTION_EXPIRED);
        }

        let result;

        try {
            result = await this.run(params);
        } finally {
            await this.destroy();
        }

        return result;
    }
}

export default StoredTriggerableAction;

