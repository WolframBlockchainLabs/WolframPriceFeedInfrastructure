import Exchange from '../../lib/domain-model/entities/Exchange.js';
import Market from '../../lib/domain-model/entities/Market.js';
import OrderBook from '../../lib/domain-model/entities/OrderBook.js';
import Trade from '../../lib/domain-model/entities/Trade.js';
import Ticker from '../../lib/domain-model/entities/Ticker.js';
import CandleStick from '../../lib/domain-model/entities/CandleStick.js';
import ExchangeRate from '../../lib/domain-model/entities/ExchangeRate.js';

class StressTestSeeder {
    async execute() {}

    async cleanup() {
        await Trade.destroy({ truncate: { cascade: true } });
        await Ticker.destroy({ truncate: { cascade: true } });
        await CandleStick.destroy({ truncate: { cascade: true } });
        await ExchangeRate.destroy({ truncate: { cascade: true } });
        await OrderBook.destroy({ truncate: { cascade: true } });
        await Market.destroy({ truncate: { cascade: true } });
        await Exchange.destroy({ truncate: { cascade: true } });
    }
}

export default StressTestSeeder;
