import { faker } from '@faker-js/faker';
import ExchangeRate from '../../../../lib/domain-model/entities/market-records/ExchangeRate.js';
import dumpExchangeRate from '../../../../lib/use-cases/utils/dumps/dumpExchangeRate.js';
import BaseMarketRecordFactory from './BaseMarketRecordFactory.js';

class ExchangeRateFactory extends BaseMarketRecordFactory {
    static DEFAULT_RECORDS_COUNT = 3;

    async createExchangeRates({
        markets = [],
        recordsCount = ExchangeRateFactory.DEFAULT_RECORDS_COUNT,
    }) {
        const exchangeRatePromises = markets.flatMap(({ id: marketId }) => {
            return Array.from({ length: recordsCount }, (_, index) => {
                return ExchangeRate.create({
                    marketId,
                    intervalStart: this.shiftDateFor(
                        ExchangeRateFactory.INITIAL_INTERVAL_START,
                        index,
                    ),
                    intervalEnd: this.shiftDateFor(
                        ExchangeRateFactory.INITIAL_INTERVAL_END,
                        index,
                    ),
                    ...this.generateExchangeRateData(),
                });
            });
        });

        const exchangeRates = await Promise.all(exchangeRatePromises);

        return exchangeRates.map((exchangeRate) => {
            return dumpExchangeRate(exchangeRate);
        });
    }

    generateExchangeRateData() {
        return {
            poolASize: faker.number.float(),
            poolBSize: faker.number.float(),
            exchangeRate: faker.number.float(),
        };
    }
}

export default ExchangeRateFactory;
