import { Op } from 'sequelize';
import Ticker from '../../../domain-model/entities/Ticker.js';

async function tickerFetch({ startDate, endDate, marketId }) {
    return Ticker.findAll({
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

export default tickerFetch;
