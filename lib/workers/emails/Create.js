import Base                  from './../Base.js';
import { TEMPLATES_BY_TYPE } from './../../infrastructure/notificator/utils/templates.js';

export default class EmailsCreate extends Base {
    static validationRules = {
        type  : [ 'required', 'string', { 'one_of': [ Object.keys(TEMPLATES_BY_TYPE) ] } ],
        email : [ 'required', 'email' ],
        data  : [ 'not_empty', 'any_object' ]
    };

    async execute({ type, email, data }) {
        await this.notificator.notify(type, email, data);

        return {};
    }
}
