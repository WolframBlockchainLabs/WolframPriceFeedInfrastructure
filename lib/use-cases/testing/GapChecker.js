import { Op } from 'sequelize';
import Base from '../BaseUseCase.js';

class GapChecker extends Base {
    static validationRules = {
        rangeDateStart: ['required', 'iso_timestamp'],
        rangeDateEnd: ['required', 'iso_timestamp', 'date_compare'],
        datatype: ['required', 'string'],
        marketId: ['string'],
        stepSize: ['positive_integer', { default: 1000 }],
    };

    async execute(config) {
        const stepsCount = await this.initializeStepsCount(config);

        const results = await this.processDataInSteps(config, stepsCount);

        return {
            data: results,
        };
    }

    async initializeStepsCount({
        stepSize,
        datatype,
        rangeDateStart,
        rangeDateEnd,
        marketId,
    }) {
        const totalRowsCount = await this.getSequelizeInstance().models[
            datatype
        ].count({
            where: {
                intervalStart: { [Op.between]: [rangeDateStart, rangeDateEnd] },
                ...(marketId && { marketId }),
            },
        });

        return Math.ceil(totalRowsCount / stepSize);
    }

    async processDataInSteps(config, stepsCount) {
        const results = { markets: {}, total: 0 };
        let lastEntryFromPrevBatch;

        for (let step = 0; step < stepsCount; step++) {
            const rows = await this.loadNextBatch({ step, ...config });
            const countData = lastEntryFromPrevBatch
                ? [lastEntryFromPrevBatch, ...rows]
                : rows;

            this.countGaps({
                data: countData,
                isLastBatch: step === stepsCount - 1,
                results,
            });
            lastEntryFromPrevBatch = rows.at(-1);

            this.getLogger().info(
                `Processed step ${step + 1} out of ${stepsCount}`,
            );
        }

        return results;
    }

    async loadNextBatch({
        step,
        datatype,
        rangeDateStart,
        rangeDateEnd,
        marketId,
        stepSize,
    }) {
        const offset = step * stepSize;

        return this.getSequelizeInstance().models[datatype].findAll({
            where: {
                intervalStart: { [Op.between]: [rangeDateStart, rangeDateEnd] },
                ...(marketId && { marketId }),
            },
            attributes: ['intervalStart', 'intervalEnd', 'marketId'],
            order: [
                ['marketId', 'ASC'],
                ['intervalStart', 'ASC'],
            ],
            limit: stepSize,
            offset,
        });
    }

    countGaps({ data, isLastBatch, results }) {
        data.forEach((item, i) => {
            const currentMarketId = item.marketId;
            results.markets[currentMarketId] ??= 0;

            if (!data[i + 1] && !isLastBatch) return;

            const isMarketChangeOrLast =
                (!data[i + 1] && isLastBatch) ||
                item.marketId !== data[i + 1]?.marketId;
            const isIntervalGap =
                item.intervalEnd.toString() !==
                data[i + 1]?.intervalStart.toString();

            if (isMarketChangeOrLast) {
                results.total += results.markets[currentMarketId];
            } else if (isIntervalGap) {
                results.markets[currentMarketId]++;
            }
        });
    }
}

export default GapChecker;
