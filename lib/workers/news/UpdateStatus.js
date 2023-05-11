import { Op }     from '../../../packages.js';

import News from '../../domain-model/News.js';
import Base     from './../Base.js';

export default class UpdateStatuses extends Base {
    static validationRules = {};

    async execute() {
        await News.update(
            { status: News.STATUS_PUBLISHED },
            { where : {
                publishedAt : { [Op.lte]: new Date() },
                status      : { [Op.not]: News.STATUS_PUBLISHED }
            } }
        );

        await News.update(
            {
                status      : News.STATUS_DRAFT,
                publishedAt : null,
                publishTill : null
            },
            {
                where : {
                    publishTill : { [Op.lte]: new Date() },
                    status      : { [Op.not]: News.STATUS_DRAFT }
                }
            }
        );

        this.info('Done');

        return {};
    }
}
