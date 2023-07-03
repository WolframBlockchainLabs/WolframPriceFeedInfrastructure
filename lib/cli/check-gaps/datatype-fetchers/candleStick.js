import { Op } from 'sequelize';
import CandleStick from '../../../domain-model/entities/CandleStick.js';

async function candleStickFetch({ startDate, endDate, marketId }) {
    return CandleStick.findAll({
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

export default candleStickFetch;
