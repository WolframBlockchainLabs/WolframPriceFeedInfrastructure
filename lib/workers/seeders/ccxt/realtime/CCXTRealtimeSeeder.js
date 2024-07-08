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
        const [, created] = await Market.updateOrCreate(
            {
                symbol,
                exchangeId,
            },
            {
                active: true,
                ...data,
            },
        );

        return created;
    }
}

export default CCXTRealtimeSeeder;
