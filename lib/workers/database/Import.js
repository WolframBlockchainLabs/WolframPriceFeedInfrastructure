/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
import Base     from './../Base.js';
import User     from './../../domain-model/User.js';
import Role     from './../../domain-model/Role.js';

export default class DatabaseImport extends Base {
    static validationRules = {};

    async execute() {
        await User.destroy({ where: {} });
        await Role.destroy({ where: {} });

        await Role.resetPermissions();

        const role = await Role.findOne({ where: { name: 'superadmin' } });

        await User.register({
            email       : 'admin@gmail.com',
            firstName   : 'Admin',
            lastName    : 'Admin',
            password    : '12passw0rd34',
            roleId      : role.id,
            status      : User.STATUS_ACTIVE,
            authEnabled : false
        });

        this.info('Done');

        return {};
    }
}
