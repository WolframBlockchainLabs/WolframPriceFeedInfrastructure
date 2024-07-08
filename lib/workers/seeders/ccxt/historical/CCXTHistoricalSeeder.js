import Market from '#domain-model/entities/Market.js';
import CCXTSeeder from '../CCXTSeeder.js';

class CCXTHistoricalSeeder extends CCXTSeeder {
    async resetMarketStatuses(exchangeId) {
        await Market.update(
            { historical: false },
            {
                where: {
                    exchangeId,
                },
            },
        );
    }

    async updateOrCreateMarket({ symbol, exchangeId, ...data }) {
        const [, created] = await Market.upsert(
            {
                symbol,
                exchangeId,
                historical: true,
                ...data,
            },
            {
                where: {
                    symbol,
                    exchangeId,
                },
            },
        );

        return created;
    }
}

export default CCXTHistoricalSeeder;
