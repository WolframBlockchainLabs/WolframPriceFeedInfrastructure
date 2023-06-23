import Sequelize from 'sequelize';
import { throwError } from '../../utils/error.js';

class Base extends Sequelize.Model {
    static init(sequelize, options = {}) {
        if (this.generateSchema) {
            this.generateSchema();
        }

        // TODO: rename this.schema
        // schema already exists in sequelize Base model class.
        // See line 1416 in model.js : static schema(schema, options) { ... }
        super.init(this.schema, {
            tableName: this.tableName,
            ...options,
            sequelize,
            ...this.options,
        });
    }

    static initRelationsAndHooks() {
        if (this.initRelations) this.initRelations();
        if (this.initHooks) this.initHooks();
    }

    static async findOneOrFail(data, fields = null) {
        const entity = await this.findOne(data);

        if (!entity) {
            throwError(`${this.notFoundCode()}`, fields || data?.where || {});
        }

        return entity;
    }

    static notFoundCode() {
        return `${this.options.name.singular.toUpperCase()}_NOT_FOUND`;
    }

    static notUniqCode() {
        return `${this.options.name.singular.toUpperCase()}_NOT_UNIQUE`;
    }

    async save(...args) {
        try {
            return await super.save(...args);
        } catch (x) {
            if (x instanceof Sequelize.UniqueConstraintError) {
                const field = x.errors[0].path.split('.')[1];

                throwError(`${this.constructor.notUniqCode()}`, {
                    [field]: 'NOT_UNIQUE',
                });
            }

            throw x;
        }
    }
}

export default Base;
