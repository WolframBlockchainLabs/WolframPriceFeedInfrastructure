import { Op } from 'sequelize';
import Trade from '../../../domain-model/entities/Trade.js';

async function tradeFetch({ startDate, endDate, marketId }) {
    return Trade.findAll({
        where: {
            intervalStart: { [Op.gte]: startDate },
            intervalEnd: { [Op.lte]: endDate },
            ...(marketId && { marketId }),
        },
        attributes: ['intervalStart', 'intervalEnd', 'marketId'],
        order: [
            ['marketId', 'ASC'],
            ['intervalStart', 'ASC'],
        ],
    });
}

export default tradeFetch;
