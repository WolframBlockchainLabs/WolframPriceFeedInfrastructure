import Sequelize      from 'sequelize';
import { throwError } from './../utils/error.js';

class Base extends Sequelize.Model {
    static init(sequelize, options = {}) {
        if (this.generateSchema) {
            this.generateSchema();
        }

        // TODO: rename this.schema
        // schema already exists in sequelize Base model class.
        // See line 1416 in model.js : static schema(schema, options) { ... }
        super.init(this.schema, {
            tableName : this.tableName,
            ...options,
            sequelize,
            ...this.options
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

                throwError(`${this.constructor.notUniqCode()}`, { [field]: 'NOT_UNIQUE' });
            }

            throw x;
        }
    }

    async load(preset, params = {}) {
        const include = `${preset}Include`;

        return this.reload({
            include : this.constructor[include](),
            ...params
        });
    }

    static customFieldOrder(field, sortedValues, order = '') {
        return [
            Sequelize.literal(`FIELD(${field},${sortedValues.map(item => `'${item}'`).join(',')}) ${order}`)
        ];
    }


    static async paginate({ col = 'id', scope = [], itemsInclude, ...params }) {
        const rows = await this.scope(scope).findAll({
            where      : {},
            subQuery   : false,
            group      : [ col ],
            attributes : [ col ],
            ...params
        });

        const count = await this.scope(scope).count({
            where    : {},
            distinct : true,
            subQuery : false,
            col,
            ...params
        });

        const ids = rows.map(row => row[col]);

        const items = itemsInclude ? await this.findAll({
            include : itemsInclude,
            where   : { [col]: ids },
            order   : rows.length ? [ this.customFieldOrder(`${this.name}.${col}`, ids) ] : []
        }) : [];

        return { rows, count, items };
    }

    static async fetchInstance({ col = 'id', scope = [], itemInclude, ...params }) {
        const row = await this.scope(scope).findOne({
            raw        : true,
            subQuery   : false,
            attributes : [ col ],
            ...params
        });

        if (row) {
            return this.findOne({
                where   : { [col]: row[col] },
                include : itemInclude
            });
        }

        return null;
    }
}

export default Base;
