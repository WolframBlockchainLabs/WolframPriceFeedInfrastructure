import { Op } from 'sequelize';

class GapChecker {
    constructor({
        logger,
        sequelize,
        startDate,
        endDate,
        datatype,
        marketId,
        stepSize,
    }) {
        this.logger = logger;
        this.sequelize = sequelize;

        this.startDate = startDate;
        this.endDate = endDate;
        this.datatype = datatype;
        this.marketId = marketId;

        this.stepSize = stepSize ?? 1000;

        this.results = {
            markets: {},
            total: 0,
        };
    }

    async execute() {
        const totalRowsCount = await this.getDataCount();
        const stepsCount = Math.ceil(totalRowsCount / this.stepSize);
        let lastEntryFromPrevBatch;

        for (let step = 0; step < stepsCount; step++) {
            const rows = await this.loadNextBatch(step * this.stepSize);
            const countData = lastEntryFromPrevBatch
                ? [lastEntryFromPrevBatch, ...rows]
                : rows;

            this.countGaps(countData, step === stepsCount - 1);
            lastEntryFromPrevBatch = rows.at(-1);

            this.logger.info(`step ${step + 1} out of ${stepsCount}`);
        }

        return this.results;
    }

    countGaps(data, isLastBatch) {
        const { results } = this;

        for (let i = 0; i <= data.length - 1; i++) {
            const currentMarketId = data[i].marketId;
            results.markets[currentMarketId] ??= 0;

            if (!data[i + 1] && !isLastBatch) continue;

            if (
                (!data[i + 1] && isLastBatch) ||
                data[i].marketId !== data[i + 1].marketId
            ) {
                results.total += results.markets[currentMarketId];
            } else if (
                data[i].intervalEnd.toString() !==
                data[i + 1].intervalStart.toString()
            ) {
                results.markets[currentMarketId]++;
            }
        }
    }

    async getDataCount() {
        const { sequelize, datatype, startDate, endDate, marketId } = this;

        return sequelize.models[datatype].count({
            where: {
                intervalStart: { [Op.between]: [startDate, endDate] },
                ...(marketId && { marketId }),
            },
        });
    }

    async loadNextBatch(offset = 0) {
        const { sequelize, datatype, startDate, endDate, marketId, stepSize } =
            this;

        return sequelize.models[datatype].findAll({
            where: {
                intervalStart: { [Op.between]: [startDate, endDate] },
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
}

export default GapChecker;
