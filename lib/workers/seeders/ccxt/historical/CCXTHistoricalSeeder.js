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
        const [, created] = await Market.updateOrCreate(
            {
                symbol,
                exchangeId,
            },
            {
                historical: true,
                ...data,
            },
        );

        return created;
    }
}

export default CCXTHistoricalSeeder;
