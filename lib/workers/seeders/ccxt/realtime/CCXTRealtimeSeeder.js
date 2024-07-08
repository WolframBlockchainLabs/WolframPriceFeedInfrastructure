import Market from '#domain-model/entities/Market.js';
import CCXTSeeder from '../CCXTSeeder.js';

class CCXTRealtimeSeeder extends CCXTSeeder {
    async resetMarketStatuses(exchangeId) {
        await Market.update(
            { active: false },
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
                active: true,
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

export default CCXTRealtimeSeeder;
