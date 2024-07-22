import Sequelize from 'sequelize';
import NotFoundException from '../exceptions/database/NotFoundException.js';
import NotUniqueException from '../exceptions/database/NotUniqueException.js';
import ReferencedException from '#domain-model/exceptions/database/ReferencedException.js';
import RelationException from '#domain-model/exceptions/database/RelationException.js';

class BaseEntity extends Sequelize.Model {
    static init(sequelize, options = {}) {
        if (this.generateSchema) {
            this.generateSchema();
        }

        // TODO: rename this.schema
        // schema already exists in sequelize Base model class.
        // See line 1416 in model.js : static schema(schema, options) { ... }
        super.init(this.schema, {
            tableName: this.TABLE_NAME,
            ...options,
            sequelize,
            ...this.options,
        });
    }

    static initRelationsAndHooks() {
        if (this.initRelations) this.initRelations();
        if (this.initHooks) this.initHooks();
    }

    static setSequelize(sequelize) {
        if (!this.sequelize) {
            this.sequelize = sequelize;
        }
    }

    static setConfig(config) {
        if (!this.config) {
            this.config = config;
        }
    }

    static async findOneOrFail(data) {
        const entity = await this.findOne(data);

        if (!entity) {
            throw new NotFoundException(this.getEntityName());
        }

        return entity;
    }

    static async findOrCreate(...args) {
        try {
            return await super.findOrCreate(...args);
        } catch (error) {
            if (error instanceof NotUniqueException) {
                return [null, false];
            }

            throw error;
        }
    }

    static async updateOrCreate(searchCriteria, updateValues) {
        const existingRecord = await this.findOne({ where: searchCriteria });

        if (existingRecord) {
            await existingRecord.update(updateValues);

            return [existingRecord, false];
        } else {
            const createdRecord = await this.create({
                ...searchCriteria,
                ...updateValues,
            });

            return [createdRecord, true];
        }
    }

    static async destroy(...args) {
        try {
            return await super.destroy(...args);
        } catch (error) {
            if (error instanceof Sequelize.ForeignKeyConstraintError) {
                throw new ReferencedException();
            }

            throw error;
        }
    }

    static getEntityName() {
        return this.options.name.singular;
    }

    static translateSaveError(error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            const field = error.errors[0].path;

            throw new NotUniqueException({
                entity: this.getEntityName(),
                fields: {
                    [field]: 'NOT_UNIQUE',
                },
            });
        }

        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            throw new RelationException({
                entity: this.getEntityName(),
                table: error.original.table,
                detail: error.original.detail,
            });
        }

        throw error;
    }

    static async bulkCreate(...args) {
        try {
            return await super.bulkCreate(...args);
        } catch (error) {
            this.translateSaveError(error);
        }
    }

    async save(...args) {
        try {
            return await super.save(...args);
        } catch (error) {
            this.constructor.translateSaveError(error);
        }
    }

    async destroy(...args) {
        try {
            return await super.destroy(...args);
        } catch (error) {
            if (error instanceof Sequelize.ForeignKeyConstraintError) {
                throw new ReferencedException();
            }

            throw error;
        }
    }
}

export default BaseEntity;
