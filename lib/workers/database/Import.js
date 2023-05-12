/* eslint-disable more/no-hardcoded-password */
/* eslint-disable more/no-hardcoded-configuration-data */
import Base from './../Base.js';
import User from './../../domain-model/User.js';


export default class DatabaseImport extends Base {
    static validationRules = {};

    async execute() {
        await User.destroy({ where: {} });


        await User.register({
            email       : 'admin@gmail.com',
            firstName   : 'Admin',
            lastName    : 'Admin',
            password    : '12passw0rd34',
            status      : User.STATUS_ACTIVE,
            authEnabled : false
        });

        this.info('Done');

        return {};
    }
}
