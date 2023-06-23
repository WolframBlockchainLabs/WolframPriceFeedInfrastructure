import Sequelize from 'sequelize';
import NotFoundException from '../exceptions/NotFoundException.js';
import NotUniqueException from '../exceptions/NotUniqueException.js';

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

    static async findOneOrFail(data) {
        const entity = await this.findOne(data);

        if (!entity) {
            throw new NotFoundException(this.notFoundCode());
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
        } catch (error) {
            if (error instanceof Sequelize.UniqueConstraintError) {
                const field = error.errors[0].path.split('.')[1];

                throw new NotUniqueException(this.constructor.notUniqCode(), {
                    [field]: 'NOT_UNIQUE',
                });
            }

            throw error;
        }
    }
}

export default Base;
