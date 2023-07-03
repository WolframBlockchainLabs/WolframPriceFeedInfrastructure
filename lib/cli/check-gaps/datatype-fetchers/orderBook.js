import { Op } from 'sequelize';
import OrderBook from '../../../domain-model/entities/OrderBook.js';

async function orderBookFetch({ startDate, endDate, marketId }) {
    return OrderBook.findAll({
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

export default orderBookFetch;
